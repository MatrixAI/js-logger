import fs from 'fs';
import * as fc from 'fast-check';
import {
  openSpan,
  closeSpan,
  traced,
  streamEvents,
} from '#lib/TracingManager.js';

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
  for await (const event of streamEvents()) {
    await file.write(JSON.stringify(event) + '\n');
  }
  await file.close();
})();

setInterval(async () => {
  switch (step) {
    case 0: {
      current.flags = fc.sample(flagArb, 1)[0];
      current.parentId = openSpan(`Parent-${parentIndex}`);
      nestedIds = [];
      break;
    }

    case 1: {
      if (current.flags.hasForkA) {
        await traced(`Parent-${parentIndex}-Fork-A`, async () => {
          current.forkAId = openSpan(
            `Parent-${parentIndex}-Fork-A`,
            current.parentId,
          );
          for (let i = 1; i <= current.flags.forkAChildren; i++) {
            const id = openSpan(`Fork-A-Span-${i}`, current.forkAId);
            closeSpan(id);
          }
          closeSpan(current.forkAId!);
        });
      }
      break;
    }

    case 2: {
      if (current.flags.hasForkB) {
        await traced(`Parent-${parentIndex}-Fork-B`, async () => {
          current.forkBId = openSpan(
            `Parent-${parentIndex}-Fork-B`,
            current.parentId,
          );
          for (let i = 1; i <= current.flags.forkBChildren; i++) {
            const id = openSpan(`Fork-B-Span-${i}`, current.forkBId);
            closeSpan(id);
          }
          closeSpan(current.forkBId!);
        });
      }
      break;
    }

    case 3: {
      if (current.flags.hasNested) {
        await traced(`Async-Chain-${parentIndex}`, async () => {
          let lastId = current.parentId!;
          for (let i = 1; i <= current.flags.nestedDepth; i++) {
            const label = `Async-Job-${i}`;
            const id = openSpan(label, lastId);
            nestedIds.push(id);
            lastId = id;
          }
        });
      }
      break;
    }

    case 4:
    case 5:
    case 6: {
      if (nestedIds.length > 0) {
        const toClose = nestedIds.pop();
        if (toClose) closeSpan(toClose);
      }
      break;
    }

    case 7: {
      if (current.flags.hasRejoin) {
        const merge = openSpan(
          `[Rejoins-Fork-${parentIndex}]`,
          current.parentId,
        );
        closeSpan(merge);
      }
      break;
    }

    case 8: {
      if (current.flags.hasOrphan) {
        const orphan = openSpan(`Orphan-${parentIndex}`);
        closeSpan(orphan);
      }
      break;
    }

    case 9: {
      closeSpan(current.parentId!);
      break;
    }

    case 10: {
      parentIndex++;
      step = -1;
      break;
    }
  }

  step++;
  process.stderr.write('generated data step');
}, 500);

await saveToFileP;
