type SpanJSON = {
  spanId: string;
  name: string;
  startTime: number;
  endTime: number | undefined;
  parentSpanId: string | undefined;
  isCompleted: boolean;
  children: Array<SpanJSON>;
};

type SpanEvent = {
  type: 'start' | 'stop';
  span: SpanJSON;
};

export type { SpanJSON, SpanEvent };
