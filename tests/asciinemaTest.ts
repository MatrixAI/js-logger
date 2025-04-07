import { openSpan, closeSpan, traced } from '../src/lib/tracingManager.js';

let parentIndex = 0;
let step = 0;
let nestedIds: string[] = [];

const current = {
  parentId: undefined as string | undefined,
  forkAId: undefined as string | undefined,
  forkBId: undefined as string | undefined,
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

function randomBool(prob = 0.7) {
  return Math.random() < prob;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(async () => {
  switch (step) {
    case 0: {
      current.flags = {
        hasForkA: randomBool(0.9),
        hasForkB: randomBool(0.7),
        forkAChildren: randomInt(1, 2),
        forkBChildren: randomInt(1, 2),
        hasNested: randomBool(0.6),
        nestedDepth: randomInt(1, 3),
        hasRejoin: randomBool(0.5),
        hasOrphan: randomBool(0.7),
      };

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
    case 6:
      if (nestedIds.length > 0) {
        const toClose = nestedIds.pop();
        if (toClose) closeSpan(toClose);
      }
      break;

    case 7:
      if (current.flags.hasRejoin) {
        const merge = openSpan(
          `[Rejoins-Fork-${parentIndex}]`,
          current.parentId,
        );
        closeSpan(merge);
      }
      break;

    case 8:
      if (current.flags.hasOrphan) {
        const orphan = openSpan(`Orphan-${parentIndex}`);
        closeSpan(orphan);
      }
      break;

    case 9:
      closeSpan(current.parentId!);
      break;

    case 10:
      parentIndex++;
      step = -1;
      break;
  }

  step++;
}, 200);
