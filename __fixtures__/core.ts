/**
 * Mock implementations for @actions/core
 */

import * as fs from 'fs'
import type * as core from '@actions/core'
import { jest } from '@jest/globals'

export const debug = jest
  .fn<typeof core.debug>()
  .mockImplementation(msg => console.log(`::debug::${msg}`))

export const info = jest
  .fn<typeof core.info>()
  .mockImplementation(msg => console.log(`::info::${msg}`))

export const warning = jest.fn<typeof core.warning>()

export const error = jest
  .fn<typeof core.error>()
  .mockImplementation(msg => console.log(`::error::${msg}`))

export const getInput = jest.fn<typeof core.getInput>()

export const setOutput = jest.fn<typeof core.setOutput>()

export const setFailed = jest.fn<typeof core.setFailed>()

// Summary mock that writes to GITHUB_STEP_SUMMARY file
let summaryBuffer = ''

export const summary = {
  addRaw: jest.fn((text: string) => {
    summaryBuffer += text
    return summary
  }),
  write: jest.fn(async () => {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY
    if (summaryFile) {
      fs.appendFileSync(summaryFile, summaryBuffer)
    }
    summaryBuffer = ''
  })
}

/**
 * Reset the summary buffer. Call this in beforeEach.
 */
export function resetSummaryBuffer(): void {
  summaryBuffer = ''
}
