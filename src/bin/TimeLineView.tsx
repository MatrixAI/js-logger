import type { FC } from 'react';
import React from 'react';
import { Box, Text } from 'ink';

interface Span {
  spanId: string;
  name: string;
  parentSpanId: string | undefined;
  startTime: number;
  endTime: number | undefined;
}

// We make each row = 1000 ms
const TIME_STEP_MS = 1000;

function timeToRow(timeMs: number, baseTimeMs: number) {
  return Math.floor((timeMs - baseTimeMs) / TIME_STEP_MS);
}

function assignLanes(spans: Array<Span>): Map<string, number> {
  // Sort spans by startTime ascending
  const sorted = [...spans].sort((a, b) => a.startTime - b.startTime);
  const laneMap = new Map<string, number>();
  const laneEndTime: number[] = [];

  for (const span of sorted) {
    let assignedLane = -1;
    for (let i = 0; i < laneEndTime.length; i++) {
      if (laneEndTime[i] <= span.startTime) {
        assignedLane = i;
        break;
      }
    }
    if (assignedLane < 0) {
      assignedLane = laneEndTime.length;
      laneEndTime.push(0);
    }
    laneMap.set(span.spanId, assignedLane);

    const realEnd = span.endTime ?? span.startTime + 3000;
    laneEndTime[assignedLane] = Math.max(laneEndTime[assignedLane], realEnd);
  }
  return laneMap;
}

const TimelineView: FC<{ spans: Span[] }> = ({ spans }) => {
  if (!spans.length) {
    return <Text>No spans</Text>;
  }

  const laneMap = assignLanes(spans);
  const earliest =
    Math.floor(Math.min(...spans.map((s) => s.startTime)) / TIME_STEP_MS) *
    TIME_STEP_MS;

  const latest = Math.max(...spans.map((s) => s.endTime ?? s.startTime + 3000));
  const maxLane = Math.max(...laneMap.values());
  const rowCount = 1 + timeToRow(latest, earliest);

  // Initialize a 2D grid: rowCount rows x (maxLane+1) lanes
  const grid: Array<Array<string>> = Array.from({ length: rowCount }, () =>
    Array(maxLane + 1).fill('   '),
  );

  // Fill each lane with vertical bars and optional slash
  for (const span of spans) {
    const lane = laneMap.get(span.spanId)!;
    const startRow = timeToRow(span.startTime, earliest);
    const endRow = timeToRow(span.endTime ?? span.startTime + 3000, earliest);

    // Vertical bars
    for (let r = startRow; r <= endRow; r++) {
      grid[r][lane] = ' | ';
    }

    // Insert the span name at the start row
    grid[startRow][lane] = grid[startRow][lane].replace(
      ' | ',
      ` | (${span.name})`,
    );

    // If parent ended earlier, place a slash
    if (span.parentSpanId) {
      const parent = spans.find((s) => s.spanId === span.parentSpanId);
      if (parent) {
        const parentLane = laneMap.get(parent.spanId)!;
        const parentEnd = timeToRow(
          parent.endTime ?? parent.startTime,
          earliest,
        );

        if (parentLane !== lane || parentEnd < endRow) {
          if (parentLane < lane) {
            grid[parentEnd][parentLane] = '  \\';
          } else if (parentLane > lane) {
            grid[parentEnd][parentLane] = ' / ';
          }
        }
      }
    }
  }

  const lines = grid.map((cols) => cols.join(''));

  return (
    <Box flexDirection="column">
      {lines.map((line, idx) => (
        <Box key={idx}>
          <Text>{line}</Text>
        </Box>
      ))}
    </Box>
  );
};

export default TimelineView;
