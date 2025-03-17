import React, { FC } from 'react';
import { Box, Text } from 'ink';
import { Span } from "../lib/span.js";

// Props for handling both root and child spans
interface SpanTreeProps {
  spans: Span[];
  sampleMode: string;
}

/**
 * Sort spans based on the selected sampling mode.
 */
const sortSpans = (spans: Span[], mode: string): Span[] => {
  if (mode === "logical") {
    const spanMap = new Map<string, Span>();

    // Convert objects to Span instances
    spans.forEach(span => {
      const newSpan = Object.assign(new Span(span.name, span.parentSpanId), span);
      newSpan.children = [];
      spanMap.set(span.spanId, newSpan);
    });

    const rootSpans: Span[] = [];
    spans.forEach(span => {
      if (span.parentSpanId && spanMap.has(span.parentSpanId)) {
        spanMap.get(span.parentSpanId)!.children.push(spanMap.get(span.spanId)!);
      } else {
        rootSpans.push(spanMap.get(span.spanId)!);
      }
    });

    return rootSpans;
  } else {
    return spans.sort((a, b) => a.startTime - b.startTime);
  }
};

/**
 * **Recursive Renderer**
 * - Uses box-drawing characters (│ ├ └) for structured layout.
 */
const RecursiveSpanTree: FC<{ span: Span; prefix: string; isLastChild: boolean }> = ({
  span,
  prefix,
  isLastChild,
}) => {
  const connector = isLastChild ? '└── ' : '├── ';
  const newPrefix = prefix + (isLastChild ? '    ' : '│   '); // Maintain vertical structure

  return (
    <Box flexDirection="column">
      <Text>
        {prefix}
        {connector}
        {span.name}
      </Text>

      {span.children.map((child, idx) => (
        <RecursiveSpanTree
          key={child.spanId}
          span={child}
          prefix={newPrefix}
          isLastChild={idx === span.children.length - 1}
        />
      ))}
    </Box>
  );
};

/**
 * **Main Component** (Sorts & Passes Data)
 */
const SpanTree: FC<SpanTreeProps> = ({ spans, sampleMode }) => {
  const sortedSpans = sortSpans(spans, sampleMode);

  return (
    <Box flexDirection="column">
      {sortedSpans.length === 0 ? (
        <Text>No spans to display</Text>
      ) : (
        sortedSpans.map((span, idx) => (
          <RecursiveSpanTree
            key={span.spanId}
            span={span}
            prefix=""
            isLastChild={idx === sortedSpans.length - 1}
          />
        ))
      )}
    </Box>
  );
};

export default SpanTree;
