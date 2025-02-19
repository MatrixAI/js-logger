import { Span } from "./span.js";
import fs from "fs";

const SPAN_FILE = "spans.json";

// Store all active spans in a dictionary
const activeSpans: Record<string, Span> = {};

/**
 * Opens a new span and associates it with a parent (if provided).
 * @param name - Name of the span.
 * @param parentSpanId - (Optional) ID of the parent span.
 * @returns The unique ID of the created span.
 */

function saveSpansToFile() {
    fs.writeFileSync(SPAN_FILE, JSON.stringify(Object.values(activeSpans), null, 2));
}

export function openSpan(name: string, parentSpanId: string | null = null): string {
    const newSpan = new Span(name, parentSpanId);
    activeSpans[newSpan.spanId] = newSpan;

    saveSpansToFile(); 

    console.log("Opened span:", newSpan);

    // If it's a child span, add it to the parent
    if (parentSpanId && activeSpans[parentSpanId]) {
        activeSpans[parentSpanId].children.push(newSpan);
    }

    return newSpan.spanId;
}

/**
 * Closes a span by marking its end time.
 * @param spanId - The ID of the span to close.
 * @returns The completed span or null if the span doesn't exist.
 */
export function closeSpan(spanId: string): Span | null {
    if (activeSpans[spanId]) {
        activeSpans[spanId].close();
        saveSpansToFile();
        console.log("Closed span:", activeSpans[spanId]);
        return activeSpans[spanId];
    }
    return null;
}

/**
 * Retrieves all active spans.
 * @returns An array of active spans.
 */
export function getActiveSpans(): Span[] {
    console.log("📢 Checking Active Spans at Time:", Date.now());
    console.log("📢 Stored Active Spans:", Object.values(activeSpans)); 
    return Object.values(activeSpans);
}

/**
 * Retrieves the entire trace structure as JSON.
 * @returns JSON representation of all spans.
 */
export function getTraceJSON(): string {
    return JSON.stringify(getActiveSpans().map(span => span.toJSON()), null, 2);
}
