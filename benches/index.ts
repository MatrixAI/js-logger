#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import si from 'systeminformation';
import loggerText from './logger_text';
import loggerStructured from './logger_structured';
import loggerHierarchy from './logger_hierarchy';
import loggerFiltered from './logger_filtered';
import loggerHandlers from './logger_handlers';

async function main(): Promise<void> {
  await fs.promises.mkdir(path.join(__dirname, 'results'), { recursive: true });
  await loggerText();
  await loggerStructured();
  await loggerHierarchy();
  await loggerFiltered();
  await loggerHandlers();
  const resultFilenames = await fs.promises.readdir(
    path.join(__dirname, 'results'),
  );
  const metricsFile = await fs.promises.open(
    path.join(__dirname, 'results', 'metrics.txt'),
    'w',
  );
  let concatenating = false;
  for (const resultFilename of resultFilenames) {
    if (/.+_metrics\.txt$/.test(resultFilename)) {
      const metricsData = await fs.promises.readFile(
        path.join(__dirname, 'results', resultFilename),
      );
      if (concatenating) {
        await metricsFile.write('\n');
      }
      await metricsFile.write(metricsData);
      concatenating = true;
    }
  }
  await metricsFile.close();
  const systemData = await si.get({
    cpu: '*',
    osInfo: 'platform, distro, release, kernel, arch',
    system: 'model, manufacturer',
  });
  await fs.promises.writeFile(
    path.join(__dirname, 'results', 'system.json'),
    JSON.stringify(systemData, null, 2),
  );
}

void main();
