export interface SpanJSON {
  spanId: string;
  name: string;
  startTime: number;
  endTime: number | undefined;
  parentSpanId: string | undefined;
  isCompleted: boolean;
  children: SpanJSON[];
}

class Span {
  public spanId: string;
  public name: string;
  public startTime: number;
  public endTime?: number;
  public parentSpanId?: string;
  public children: Array<Span>;

  constructor(name: string, parentSpanId: string | undefined = undefined) {
    this.spanId = `span-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`;
    this.name = name;
    this.startTime = Date.now();
    this.endTime = undefined;
    this.parentSpanId = parentSpanId;
    this.children = [];
  }

  public close(): void {
    this.endTime = Date.now();
  }

  public isCompleted(): boolean {
    return this.endTime !== undefined;
  }

  toJSON(): SpanJSON {
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
