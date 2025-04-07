import Tracer from './Tracer.js';

const tracer = new Tracer();

export const openSpan = tracer.startSpan.bind(tracer);
export const closeSpan = tracer.endSpan.bind(tracer);
export const traced = tracer.traced.bind(tracer);
export const getActiveSpans = tracer.getActiveSpans.bind(tracer);
export const getTraceJSON = tracer.getTraceJSON.bind(tracer);
export const flush = tracer.flush.bind(tracer);
export default tracer;
