import type { SpanEvent, SpanId } from './types.js';
import { IdSortable, utils as idUtils } from '@matrixai/id';

class Tracer {
  protected activeSpans: Map<SpanId, string> = new Map();
  protected queue: Array<SpanEvent> = [];
  protected resolveWaitChunksP: (() => void) | undefined;
  protected ended: boolean = false;

  protected queueSpanEvent(evt: SpanEvent) {
    // Convert the binary id to base64-encoded id
    if (evt.id instanceof IdSortable) {
      evt.id = idUtils.toMultibase(evt.id.get(), 'base64');
    }
    if (evt.spanId instanceof IdSortable) {
      evt.spanId = idUtils.toMultibase(evt.spanId.get(), 'base64');
    }
    if (evt.parentSpanId instanceof IdSortable) {
      evt.parentSpanId = idUtils.toMultibase(evt.parentSpanId.get(), 'base64');
    }
    this.queue.push(evt);
    if (this.resolveWaitChunksP != null) this.resolveWaitChunksP();
  }

  public startSpan(name: string, parentSpanId?: SpanId): SpanId {
    const spanId = new IdSortable();
    this.activeSpans.set(spanId, name);
    this.queueSpanEvent({
      type: 'start',
      id: new IdSortable(),
      spanId: spanId,
      parentSpanId: parentSpanId,
      name: name,
    });
    return spanId;
  }

  public endSpan(spanId: SpanId): void {
    const name = this.activeSpans.get(spanId);
    if (!name) return;
    this.activeSpans.delete(spanId);
    this.queueSpanEvent({
      type: 'end',
      id: new IdSortable(),
      spanId: spanId,
      name: name,
    });
  }

  public async traced<T>(
    name: string,
    parentSpanId: SpanId | undefined,
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
