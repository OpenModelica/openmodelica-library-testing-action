/**
 * Unit tests for src/installdeps.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { expect } from '@jest/globals'
import { installPythonDeps } from '../src/installdeps'

const tempTestDir = path.join('__tests__', 'tmp-installdeps')
const requirementsFile = path.join(tempTestDir, 'requirements.txt')
const requirements = `datetime
matplotlib
monotonic
natsort
joblib
ompython==3.6
simplejson
psutil
`

describe('installdeps.ts', () => {
  beforeAll(() => fs.rmSync(tempTestDir, { recursive: true, force: true }))
  afterEach(() => fs.rmSync(tempTestDir, { recursive: true, force: true }))

  it(
    'Install Python Dependencies',
    async () => {
      fs.mkdirSync(tempTestDir)
      fs.writeFileSync(requirementsFile, requirements)
      const { stdout, stderr } = await installPythonDeps(requirementsFile)

      // stderr should be empty or start with deprecation warning "DEPRECATION: ompython"
      expect(stderr === '' || stderr.startsWith('DEPRECATION: ompython')).toBe(
        true
      )

      expect(stdout).toContain('datetime')
      expect(stdout).toContain('matplotlib')
      expect(stdout).toContain('monotonic')
      expect(stdout).toContain('natsort')
      expect(stdout).toContain('joblib')
      expect(stdout).toContain('ompython')
      expect(stdout).toContain('simplejson')
      expect(stdout).toContain('psutil')
    },
    5 * 60000 /* 5 minutes */
  )
})
