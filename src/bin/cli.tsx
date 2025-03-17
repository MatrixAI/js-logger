import React, { useEffect, useState } from 'react';
import { render, Box, Text } from 'ink';
import fs from 'fs';
import SpanTree from './SpanTree.js';
import { Span } from '../lib/span.js';

const SPAN_FILE = 'spans.json';


const sampleArgIndex = process.argv.indexOf("--sample");
const sampleMode =
  sampleArgIndex !== -1 && process.argv.length > sampleArgIndex + 1
    ? process.argv[sampleArgIndex + 1].trim() === "logical"
      ? "logical"
      : "time"
    : "time"; 

console.log(`Received CLI arguments: ${process.argv.join(" ")}`);
console.log(`Running in ${sampleMode} mode`);


function loadSpans(): Span[] {
  if (!fs.existsSync(SPAN_FILE)) return [];
  return JSON.parse(fs.readFileSync(SPAN_FILE, 'utf8'));
}

const App = () => {
  const [spans, setSpans] = useState<Span[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      setSpans(loadSpans());
    }, 1000);

    const handleExit = () => {
      console.log("Stopping CLI...");
      clearInterval(id);
      process.exit(0);
    };

    process.on("SIGINT", handleExit);
    process.on("SIGTERM", handleExit);

    return () => clearInterval(id);
  }, []);

  return (
    <Box flexDirection="column">
      <Text color="cyan">Real-Time Concurrency Timeline ({sampleMode}-based)</Text>
      <Box height={1} />
      {spans.length > 0 ? (
        <SpanTree spans={spans} sampleMode={sampleMode} />
      ) : (
        <Text>No spans available</Text>
      )}
    </Box>
  );
};

render(<App />);
