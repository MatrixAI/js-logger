import path from 'node:path';
import url from 'node:url';
import tsconfigJSON from './tsconfig.json' assert { type: 'json' };

const projectPath = path.dirname(url.fileURLToPath(import.meta.url));

const globals = {
  projectDir: projectPath,
  testDir: path.join(projectPath, 'tests'),
  defaultTimeout: 20000,
  maxTimeout: Math.pow(2, 31) - 1,
};

const config = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: false,
  cacheDirectory: '<rootDir>/tmp/jest',
  coverageDirectory: '<rootDir>/tmp/coverage',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test|unit.test).+(ts|tsx|js|jsx)'],

  // Use SWC to transpile TS/JS/TSX
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: tsconfigJSON.compilerOptions.experimentalDecorators,
            dynamicImport: true,
          },
          target: tsconfigJSON.compilerOptions.target.toLowerCase(),
          keepClassNames: true,
        },
        module: {
          type: 'es6', // Crucial for ESM-style imports
        },
      },
    ],
  },

  // Required to treat TS/TSX as ESM in Jest
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],

  moduleNameMapper: {
    // Remove `.js` extension from relative imports in source like `./foo.js` → `./foo`
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/tmp/junit',
        classNameTemplate: '{classname}',
        ancestorSeparator: ' > ',
        titleTemplate: '{title}',
        addFileAttribute: 'true',
        reportTestSuiteErrors: 'true',
      },
    ],
  ],

  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  coverageReporters: ['text', 'cobertura'],

  globals,

  globalSetup: '<rootDir>/tests/globalSetup.ts',
  globalTeardown: '<rootDir>/tests/globalTeardown.ts',
  setupFiles: ['<rootDir>/tests/setup.ts'],
  setupFilesAfterEnv: ['jest-extended/all', '<rootDir>/tests/setupAfterEnv.ts'],
};

export default config;
