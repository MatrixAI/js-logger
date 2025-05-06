import type { SpanEvent, SpanId } from './types.js';
import { IdSortable } from '@matrixai/id';

class Tracer {
  protected activeSpans: Map<SpanId, string> = new Map();
  protected queue: Array<SpanEvent> = [];
  protected resolveWaitChunksP: (() => void) | undefined;
  protected ended: boolean = false;
  protected idGen = new IdSortable();

  protected nextId(): SpanId {
    const result = this.idGen.next();
    if (result.done || result.value == null) {
      throw new Error('Unexpected end of id generator');
    }
    return result.value.toMultibase('base32hex');
  }

  protected queueSpanEvent(evt: SpanEvent) {
    this.queue.push(evt);
    if (this.resolveWaitChunksP != null) this.resolveWaitChunksP();
  }

  public startSpan(name: string, parentSpanId?: SpanId): SpanId {
    const spanId = this.nextId();
    this.activeSpans.set(spanId, name);
    this.queueSpanEvent({
      type: 'start',
      id: spanId,
      parentId: parentSpanId,
      name: name,
    });
    return spanId;
  }

  public endSpan(spanId: SpanId): void {
    const name = this.activeSpans.get(spanId);
    if (!name) return;
    this.activeSpans.delete(spanId);
    this.queueSpanEvent({
      type: 'stop',
      id: this.nextId(),
      startId: spanId,
    });
  }

  public async traced<T>(
    name: string,
    parentSpanId: string | undefined,
    fn: () => T | Promise<T>,
  ): Promise<T> {
    const fnProm = async () => {
      const spanId = this.startSpan(name, parentSpanId);
      const retval = await fn();
      this.endSpan(spanId);
      return retval;
    };
    return await fnProm();
  }

  public endTracing(): void {
    this.ended = true;
  }

  public async *streamEvents(): AsyncGenerator<SpanEvent, void, void> {
    while (true) {
      const value = this.queue.shift();
      if (value == null) {
        if (this.ended) break;
        await new Promise<void>((resolve) => {
          this.resolveWaitChunksP = resolve;
        });
        continue;
      }
      yield value;
    }
  }
}

export default Tracer;
