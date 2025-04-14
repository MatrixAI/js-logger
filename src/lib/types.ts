type SpanJSON = {
  spanId: string;
  name: string;
  startTime: number;
  endTime: number | undefined;
  parentSpanId: string | undefined;
  isCompleted: boolean;
  children: Array<SpanJSON>;
};

export type { SpanJSON };
