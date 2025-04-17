import type { SpanJSON } from './types.js';

class Span {
  public spanId: string = `span-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 5)}`;
  public name: string;
  public startTime: number = Date.now();
  public endTime?: number;
  public parentSpanId?: string;
  public children: Array<Span> = [];

  constructor(name: string, parentSpanId?: string) {
    this.name = name;
    this.parentSpanId = parentSpanId;
  }

  public close(): void {
    this.endTime = Date.now();
  }

  public isCompleted(): boolean {
    return this.endTime != null;
  }

  public toJSON(): SpanJSON {
    return {
      spanId: this.spanId,
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      parentSpanId: this.parentSpanId,
      isCompleted: this.isCompleted(),
      children: this.children.map((child) => child.toJSON()),
    };
  }
}

export default Span;
