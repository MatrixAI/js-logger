import type { SpanEvent } from './types.js';
import Span from './Span.js';

class Tracer {
  protected activeSpans: Map<string, Span> = new Map();
  protected queue: Array<SpanEvent> = [];
  protected resolveWaitChunksP: (() => void) | undefined;
  protected ended: boolean = false;

  protected queueSpanEvent(span: SpanEvent) {
    this.queue.push(span);
    if (this.resolveWaitChunksP != null) this.resolveWaitChunksP();
  }

  public startSpan(name: string, parentSpanId?: string): string {
    const span = new Span(name, parentSpanId);
    this.activeSpans.set(span.spanId, span);
    if (parentSpanId && this.activeSpans.has(parentSpanId)) {
      this.activeSpans.get(parentSpanId)!.children.push(span);
    }
    this.queueSpanEvent({ type: 'start', span: span.toJSON() });
    return span.spanId;
  }

  public endSpan(spanId: string): Span | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.close();
    this.queueSpanEvent({ type: 'stop', span: span.toJSON() });
    return span;
  }

  public async traced<T>(
    name: string,
    fn: () => Promise<T>,
    parentSpanId?: string,
  ): Promise<T> {
    const spanId = this.startSpan(name, parentSpanId);
    return await fn().finally(() => this.endSpan(spanId));
  }

  public getActiveSpans(): Array<Span> {
    return Array.from(this.activeSpans.values());
  }

  public getTraceJSON(): string {
    return JSON.stringify(
      this.getActiveSpans().map((s) => s.toJSON()),
      null,
      2,
    );
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
