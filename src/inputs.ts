import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'

export interface ActionInputsInterface {
  library: string
  libraryVersion: string
  modelicaFile: string
  referenceFilesDir?: string
  referenceFileExtension?: string
  referenceFileDelimiter?: string
  pagesRootUrl: string
  omcVersion: string
  allowFailingTests: boolean
}

export class ActionInputs implements ActionInputsInterface {
  library: string
  libraryVersion: string
  modelicaFile: string
  referenceFilesDir?: string
  referenceFileExtension?: string
  referenceFileDelimiter?: string
  pagesRootUrl: string
  omcVersion: string
  allowFailingTests: boolean

  constructor(inputs: ActionInputsInterface) {
    this.library = inputs.library
    this.libraryVersion = inputs.libraryVersion
    this.modelicaFile = inputs.modelicaFile
    this.referenceFilesDir = inputs.referenceFilesDir
    this.referenceFileExtension = inputs.referenceFileExtension
    this.referenceFileDelimiter = inputs.referenceFileDelimiter
    this.pagesRootUrl = inputs.pagesRootUrl
    this.omcVersion = inputs.omcVersion
    this.allowFailingTests = inputs.allowFailingTests
  }

  static newFromGitHub(): ActionInputs {
    const library = core.getInput('library', { required: true })
    const libraryVersion = sanitize(
      core.getInput('library-version', { required: true })
    )
    const modelicaFile = path.resolve(
      core.getInput('modelica-file', { required: true })
    )
    const referenceFilesDir =
      core.getInput('reference-files-dir') !== ''
        ? path.resolve(core.getInput('reference-files-dir'))
        : undefined
    const referenceFileExtension =
      core.getInput('reference-files-extension') !== ''
        ? core.getInput('reference-files-extension')
        : undefined
    const referenceFileDelimiter =
      core.getInput('reference-files-delimiter') !== ''
        ? core.getInput('reference-files-delimiter')
        : undefined
    const pagesRootUrl = core.getInput('pages-root-url')
    const omcVersion = core.getInput('omc-version', { required: true })
    const allowFailingTests = strToBool(
      core.getInput('allow-failing-tests', { required: true })
    )

    // Check inputs
    if (!fs.existsSync(modelicaFile)) {
      throw new Error(
        `Can't find file '${modelicaFile}' from input modelica-file: '${core.getInput(
          'modelica-file'
        )}'`
      )
    }
    // TODO: Check if there are reference files in referenceFilesDir
    if (omcVersion === '') {
      throw new Error("Input 'omc-version' can't be empty")
    }

    return new ActionInputs({
      library,
      libraryVersion,
      modelicaFile,
      referenceFilesDir,
      referenceFileExtension,
      referenceFileDelimiter,
      pagesRootUrl,
      omcVersion,
      allowFailingTests
    } as ActionInputsInterface)
  }
}

/**
 * Return sanitized copy of string by removing all `/`.
 *
 * Useful for versions that are GitHub references.
 *   - Replace 'pull/' with 'pr'
 *   - Remove 'refs/' and 'merge/'
 *
 * @param version Version string
 * @returns Sanitized version string
 */
function sanitize(version: string): string {
  return version
    .replace('refs/', '')
    .replace('pull/', 'pr-')
    .replaceAll('/merge', '')
    .replaceAll('/', '-')
}

/**
 * Convert string to boolean.
 *
 * Every version of upper and lower cases of 'true' and '1' are true.
 *
 * @param str String to be converted.
 * @returns Boolean
 */
function strToBool(str: string): boolean {
  return str.toLowerCase() === 'true' || str === '1'
}
