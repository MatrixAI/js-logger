import fs from 'fs';
import * as fc from 'fast-check';
import tracer from '#tracer/index.js';

let parentIndex = 0;
let step = 0;
let nestedIds: Array<string> = [];

type Flags = {
  hasForkA: boolean;
  hasForkB: boolean;
  forkAChildren: number;
  forkBChildren: number;
  hasNested: boolean;
  nestedDepth: number;
  hasRejoin: boolean;
  hasOrphan: boolean;
};

const current: {
  parentId?: string;
  forkAId?: string;
  forkBId?: string;
  flags: Flags;
} = {
  flags: {
    hasForkA: true,
    hasForkB: true,
    forkAChildren: 2,
    forkBChildren: 2,
    hasNested: true,
    nestedDepth: 3,
    hasRejoin: true,
    hasOrphan: true,
  },
};

const flagArb = fc.record({
  hasForkA: fc.boolean(),
  hasForkB: fc.boolean(),
  forkAChildren: fc.integer({ min: 1, max: 2 }),
  forkBChildren: fc.integer({ min: 1, max: 2 }),
  hasNested: fc.boolean(),
  nestedDepth: fc.integer({ min: 1, max: 3 }),
  hasRejoin: fc.boolean(),
  hasOrphan: fc.boolean(),
});

const saveToFileP = (async () => {
  const file = await fs.promises.open('span.jsonl', 'w');
  for await (const event of tracer.streamEvents()) {
    await file.write(JSON.stringify(event) + '\n');
  }
  await file.close();
})();

setInterval(async () => {
  switch (step) {
    case 0: {
      current.flags = fc.sample(flagArb, 1)[0];
      current.parentId = tracer.startSpan(`Parent-${parentIndex}`);
      nestedIds = [];
      break;
    }

    case 1: {
      if (current.flags.hasForkA) {
        await tracer.traced(
          `Parent-${parentIndex}-Fork-A`,
          undefined,
          async () => {
            current.forkAId = tracer.startSpan(
              `Parent-${parentIndex}-Fork-A`,
              current.parentId,
            );
            for (let i = 1; i <= current.flags.forkAChildren; i++) {
              const id = tracer.startSpan(`Fork-A-Span-${i}`, current.forkAId);
              tracer.endSpan(id);
            }
            tracer.endSpan(current.forkAId!);
          },
        );
      }
      break;
    }

    case 2: {
      if (current.flags.hasForkB) {
        await tracer.traced(
          `Parent-${parentIndex}-Fork-B`,
          undefined,
          async () => {
            current.forkBId = tracer.startSpan(
              `Parent-${parentIndex}-Fork-B`,
              current.parentId,
            );
            for (let i = 1; i <= current.flags.forkBChildren; i++) {
              const id = tracer.startSpan(`Fork-B-Span-${i}`, current.forkBId);
              tracer.endSpan(id);
            }
            tracer.endSpan(current.forkBId!);
          },
        );
      }
      break;
    }

    case 3: {
      if (current.flags.hasNested) {
        await tracer.traced(
          `Async-Chain-${parentIndex}`,
          undefined,
          async () => {
            let lastId = current.parentId!;
            for (let i = 1; i <= current.flags.nestedDepth; i++) {
              const label = `Async-Job-${i}`;
              const id = tracer.startSpan(label, lastId);
              nestedIds.push(id);
              lastId = id;
            }
          },
        );
      }
      break;
    }

    case 4:
    case 5:
    case 6: {
      if (nestedIds.length > 0) {
        const toClose = nestedIds.pop();
        if (toClose) tracer.endSpan(toClose);
      }
      break;
    }

    case 7: {
      if (current.flags.hasRejoin) {
        const merge = tracer.startSpan(
          `[Rejoins-Fork-${parentIndex}]`,
          current.parentId,
        );
        tracer.endSpan(merge);
      }
      break;
    }

    case 8: {
      if (current.flags.hasOrphan) {
        const orphan = tracer.startSpan(`Orphan-${parentIndex}`);
        tracer.endSpan(orphan);
      }
      break;
    }

    case 9: {
      tracer.endSpan(current.parentId!);
      break;
    }

    case 10: {
      parentIndex++;
      step = -1;
      break;
    }
  }

  step++;
  process.stderr.write('generated data step\n');
}, 500);

await saveToFileP;
