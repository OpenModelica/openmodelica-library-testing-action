import { createDefaultEsmPreset } from 'ts-jest'

const presetConfig = createDefaultEsmPreset({
  tsconfig: './tsconfig.test.json'
})

// Module name mapper to resolve .js imports to .ts files for ESM support
const moduleNameMapper = {
  '^(\\.{1,2}/.*)\\.js$': '$1'
}

/** @type {import('jest').Config} */
const config = {
  ...presetConfig,
  verbose: true,
  clearMocks: true,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  projects: [
    {
      displayName: 'unit-tests',
      testEnvironment: 'node',
      testMatch: ['**/*.test.ts'],
      testPathIgnorePatterns: ['main.test.ts', '/node_modules/', '/dist/'],
      moduleNameMapper,
      ...presetConfig
    },
    {
      displayName: 'main-test',
      testEnvironment: 'node',
      testMatch: ['**/main.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/'],
      moduleNameMapper,
      ...presetConfig
    }
  ],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**']
}

export default config
