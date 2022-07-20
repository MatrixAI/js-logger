#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import si from 'systeminformation';
import loggerText from './logger_text';
import loggerStructured from './logger_structured';
import loggerHierarchy from './logger_hierarchy';
import loggerFiltered from './logger_filtered';

async function main(): Promise<void> {
  await fs.promises.mkdir(path.join(__dirname, 'results'), { recursive: true });
  await loggerText();
  await loggerStructured();
  await loggerHierarchy();
  await loggerFiltered();
  const systemData = await si.get({
    cpu: '*',
    osInfo: 'platform, distro, release, kernel, arch',
    system: 'model, manufacturer',
  });
  await fs.promises.writeFile(
    'benches/results/system.json',
    JSON.stringify(systemData, null, 2),
  );
}

void main();
