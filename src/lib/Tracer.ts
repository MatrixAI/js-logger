import fs from 'fs';
import Span from './Span.js';

export default class Tracer {
  private activeSpans: Map<string, Span> = new Map();
  private spanFile = 'spans.json';
  private jsonlStream = fs.createWriteStream('spans.jsonl', { flags: 'a' });

  public startSpan(name: string, parentSpanId?: string): string {
    const span = new Span(name, parentSpanId);
    this.activeSpans.set(span.spanId, span);

    if (parentSpanId && this.activeSpans.has(parentSpanId)) {
      this.activeSpans.get(parentSpanId)!.children.push(span);
    }

    this.saveSpansToFile();
    return span.spanId;
  }

  public endSpan(spanId: string): Span | null {
    const span = this.activeSpans.get(spanId);
    if (!span) return null;

    span.close();
    this.jsonlStream.write(JSON.stringify(span.toJSON()) + '\n');
    this.saveSpansToFile();
    return span;
  }

  public traced<T>(
    name: string,
    fn: () => Promise<T>,
    parentSpanId?: string,
  ): Promise<T> {
    const spanId = this.startSpan(name, parentSpanId);
    return fn()
      .then((result) => {
        this.endSpan(spanId);
        return result;
      })
      .catch((err) => {
        this.endSpan(spanId);
        throw err;
      });
  }

  public getActiveSpans(): Span[] {
    return Array.from(this.activeSpans.values());
  }

  public flush(): void {
    this.saveSpansToFile();
  }

  public getTraceJSON(): string {
    return JSON.stringify(
      this.getActiveSpans().map((s) => s.toJSON()),
      null,
      2,
    );
  }

  private saveSpansToFile(): void {
    fs.writeFileSync(
      this.spanFile,
      JSON.stringify(this.getActiveSpans(), null, 2),
    );
  }
}
