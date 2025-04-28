import type Span from '../lib/Span.js';
import fs from 'fs';
import { Command } from 'commander';
import { useEffect, useState } from 'react';
import { render, Box, Text } from 'ink';
import SpanTree from './SpanTree.js';

// Use commander to parse CLI options
const program = new Command();
program
  .option('--sample <mode>', 'Sampling mode: logical or time', 'time')
  .parse();

const options = program.opts();
const sampleMode = options.sample;

async function loadSpans(): Promise<Array<Span>> {
  const spans: Array<Span> = [];
  const file = await fs.promises.open('span.jsonl', 'r');
  for await (const line of file.readLines()) {
    spans.push(JSON.parse(line));
  }
  await file.close();
  return spans;
}

const App = () => {
  const [spans, setSpans] = useState<Array<Span>>([]);

  useEffect(() => {
    const id = setInterval(() => {
      (async () => {
        const result = await loadSpans();
        setSpans(result);
      })();
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
