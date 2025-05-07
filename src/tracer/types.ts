type SpanId = string & { readonly brand: unique symbol };

/**
 * A span is a virtual concept, not an actual object. A span is made up of
 * multiple events. Each event gets its own ID. Each start event must be
 * associated with a stop event, otherwise the span is considered to be
 * ongoing.
 */

type SpanStart = {
  type: 'start';
  id: SpanId;
  parentId?: SpanId;
  name?: string;
};

type SpanStop = {
  type: 'stop';
  id: SpanId;
  startId: SpanId;
  parentId?: SpanId;
};

type SpanEvent = SpanStart | SpanStop;

export type { SpanId, SpanEvent };
