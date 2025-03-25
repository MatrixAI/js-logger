import type Span from '../lib/Span.js';
import fs from 'fs';
import { Command } from 'commander';
import React, { useEffect, useState } from 'react';
import { render, Box, Text } from 'ink';
import SpanTree from './SpanTree.js';

const SPAN_FILE = 'spans.json';

// Use commander to parse CLI options
const program = new Command();
program
  .option('--sample <mode>', 'Sampling mode: logical or time', 'time')
  .parse();

const options = program.opts();
const sampleMode = options.sample;

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
      process.stdout.write('Stopping CLI...\n');
      clearInterval(id);
      process.exit(0);
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
    process.on('SIGHUP', handleExit);
    process.on('SIGABRT', handleExit);

    return () => clearInterval(id);
  }, []);

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        Real-Time Concurrency Timeline ({sampleMode}-based)
      </Text>
      <Box height={1} />
      {spans.length > 0 ? (
        <SpanTree spans={spans} mode={sampleMode} />
      ) : (
        <Text>No spans available</Text>
      )}
    </Box>
  );
};

render(<App />);
