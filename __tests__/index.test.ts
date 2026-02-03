/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import { expect, jest, describe, it } from '@jest/globals'

// Mock the main module before importing
const runMock = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)

jest.unstable_mockModule('../src/main', () => ({
  run: runMock
}))

describe('index', () => {
  it('calls run when imported', async () => {
    // Dynamic import after mocking
    await import('../src/index')

    expect(runMock).toHaveBeenCalled()
  })
})
