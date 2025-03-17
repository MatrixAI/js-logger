import { openSpan, closeSpan } from '../src/lib/tracingManager.js';

// 1) Root Span: starts at t=0, ends at t=8000ms
const rootSpanId = openSpan('Root Span');
console.log('Opened Root Span:', rootSpanId);

// 2) Start a child “Parent span ends earlier” at t=1000ms, end at t=3000ms
setTimeout(() => {
  const earlyChildId = openSpan('Parent span ends earlier', rootSpanId);
  console.log('Opened early child:', earlyChildId);

  setTimeout(() => {
    closeSpan(earlyChildId);
    console.log('Closed early child:', earlyChildId);
  }, 2000);
}, 1000);

// 3) Another child “Forking” at t=2000ms, ends at t=6000ms
setTimeout(() => {
  const forkingId = openSpan('Forking', rootSpanId);
  console.log('Opened Forking child:', forkingId);

  setTimeout(() => {
    closeSpan(forkingId);
    console.log('Closed Forking child:', forkingId);
  }, 4000);
}, 2000);

// 4) An “Orphan” (no parent) at t=3000ms, ends at t=7000ms
setTimeout(() => {
  const orphanId = openSpan('Orphan', null);
  console.log('Opened Orphan:', orphanId);

  setTimeout(() => {
    closeSpan(orphanId);
    console.log('Closed Orphan:', orphanId);
  }, 4000);
}, 3000);

// Finally, close root at t=8000ms
setTimeout(() => {
  closeSpan(rootSpanId);
  console.log('Closed Root Span:', rootSpanId);
}, 8000);
