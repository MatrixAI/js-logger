import Tracer from '#lib/Tracer.js';

const tracer = new Tracer();

const openSpan = (spanId: string, parentSpanId?: string) =>
  tracer.startSpan(spanId, parentSpanId);
const closeSpan = (spanId: string) => tracer.endSpan(spanId);
const traced = (
  name: string,
  fn: () => Promise<unknown>,
  parentSpanId?: string,
) => tracer.traced(name, fn, parentSpanId);
const getActiveSpans = () => tracer.getActiveSpans();
const getTraceJSON = () => tracer.getTraceJSON();
const streamEvents = () => tracer.streamEvents();
const endTracing = () => tracer.endTracing();

export default tracer;
export {
  openSpan,
  closeSpan,
  traced,
  getActiveSpans,
  getTraceJSON,
  streamEvents,
  endTracing,
};
