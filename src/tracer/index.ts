import Tracer from './Tracer.js';

// We don't export tracer class, but an instance which has all its methods
const tracer = new Tracer();
export default tracer;

export * from './types.js';
