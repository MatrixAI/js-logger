type Span = {
  spanId: string;
  name: string;
  parentSpanId?: string;
};

type SpanEvent = Span & {
  type: 'start' | 'end';
  id: string;
};

export type { Span, SpanEvent };
