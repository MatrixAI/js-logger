import type { IdSortable } from '@matrixai/id';

type SpanId = IdSortable | string;
type EventId = IdSortable | string;

type Span = {
  spanId: SpanId;
  name: string;
  parentSpanId?: SpanId;
};

type SpanEvent = Span & {
  type: 'start' | 'end';
  id: EventId;
};

export type { SpanId, EventId, Span, SpanEvent };
