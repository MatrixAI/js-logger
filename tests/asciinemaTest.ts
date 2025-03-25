import { openSpan, closeSpan } from '../src/lib/tracingManager.js';

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

setInterval(() => {
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
      nestedIds = []; // Reset nested tracking
      break;
    }

    case 1:
      if (current.flags.hasForkA) {
        current.forkAId = openSpan(
          `Parent-${parentIndex}-Fork-A`,
          current.parentId,
        );
      }
      break;

    case 2:
    case 3:
      if (current.flags.hasForkA && step - 2 < current.flags.forkAChildren) {
        const id = openSpan(`Fork-A-Span-${step - 1}`, current.forkAId);
        closeSpan(id);
      }
      break;

    case 4:
      if (current.flags.hasForkA) closeSpan(current.forkAId!);
      break;

    case 5:
      if (current.flags.hasForkB) {
        current.forkBId = openSpan(
          `Parent-${parentIndex}-Fork-B`,
          current.parentId,
        );
      }
      break;

    case 6:
    case 7:
      if (current.flags.hasForkB && step - 6 < current.flags.forkBChildren) {
        const id = openSpan(`Fork-B-Span-${step - 5}`, current.forkBId);
        closeSpan(id);
      }
      break;

    case 8:
      if (current.flags.hasForkB) closeSpan(current.forkBId!);
      break;

    // Dynamically open nested spans with randomized depth and better naming
    case 9: {
      if (current.flags.hasNested) {
        let lastId = current.parentId!;
        for (let i = 1; i <= current.flags.nestedDepth; i++) {
          const label = `Async-Job-${i}`;
          const id = openSpan(label, lastId);
          nestedIds.push(id);
          lastId = id;
        }
      }
      break;
    }

    // Close nested spans in reverse order
    case 10: {
      if (nestedIds.length > 0) {
        const toClose = nestedIds.pop();
        if (toClose) closeSpan(toClose);
      }
      break;
    }

    case 11:
      if (nestedIds.length > 0) {
        const toClose = nestedIds.pop();
        if (toClose) closeSpan(toClose);
      }
      break;

    case 12:
      if (nestedIds.length > 0) {
        const toClose = nestedIds.pop();
        if (toClose) closeSpan(toClose);
      }
      break;

    case 13:
      if (current.flags.hasRejoin) {
        const merge = openSpan(
          `[Rejoins-Fork-${parentIndex}]`,
          current.parentId,
        );
        closeSpan(merge);
      }
      break;

    case 14:
      if (current.flags.hasOrphan) {
        const orphan = openSpan(`Orphan-${parentIndex}`);
        closeSpan(orphan);
      }
      break;

    case 15:
      closeSpan(current.parentId!);
      break;

    case 16:
      parentIndex++;
      step = -1;
      break;
  }

  step++;
}, 200);
