import fs from 'fs';
import Span from './Span.js';

const SPAN_FILE = 'spans.json';
const activeSpans: Record<string, Span> = {};

function reconstructSpan(spanData: any): Span {
  delete spanData.isCompleted;

  const reconstructedSpan = Object.assign(
    new Span(spanData.name, spanData.parentSpanId),
    spanData,
  );
  reconstructedSpan.children = (spanData.children || []).map(reconstructSpan);
  return reconstructedSpan;
}

function saveSpansToFile() {
  fs.writeFileSync(
    SPAN_FILE,
    JSON.stringify(Object.values(activeSpans), undefined, 2),
  );
}

export function openSpan(
  name: string,
  parentSpanId: string | undefined = undefined,
): string {
  const newSpan = new Span(name, parentSpanId);
  activeSpans[newSpan.spanId] = newSpan;

  saveSpansToFile();

  if (parentSpanId && activeSpans[parentSpanId]) {
    activeSpans[parentSpanId].children.push(newSpan);
  }

  return newSpan.spanId;
}

export function closeSpan(spanId: string): Span | undefined {
  if (activeSpans[spanId]) {
    activeSpans[spanId].close();
    saveSpansToFile();
    return activeSpans[spanId];
  }
  return undefined;
}

export function getActiveSpans(): Span[] {
  if (fs.existsSync(SPAN_FILE)) {
    const fileData = fs.readFileSync(SPAN_FILE, 'utf8');
    const rawSpans = JSON.parse(fileData);
    return rawSpans.map(reconstructSpan);
  }

  return Object.values(activeSpans);
}

export function getTraceJSON(): string {
  const activeSpans = getActiveSpans();

  return JSON.stringify(
    activeSpans.map((span) => span.toJSON()),
    undefined,
    2,
  );
}
