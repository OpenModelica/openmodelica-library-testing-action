import * as path from 'path'
import * as fs from 'fs'
import * as child_process from 'child_process'
import * as core from '@actions/core'

import { cloneScripts } from './clone'
import { copyHtmlFilesSync, uploadArtifacts } from './collect'
import { Configuration, genConfigFile } from './config'
import { installPythonDeps } from './installdeps'
import { summaryFromHtmlFile } from './summary'

/**
 * Run Python script.
 *
 * @param scriptPath  Path to Python script.
 * @param args        Arguments of script.
 * @returns           Promise resolving when Python process exits.
 */
async function runPythonScript(
  scriptPath: string,
  args: string[]
): Promise<{ stdout: string; stderr: string }> {
  const command = `python ${scriptPath} ${args.join(' ')}`
  core.debug(`Running ${command}`)

  return new Promise((resolve, reject) => {
    child_process.exec(command, (error, stdout, stderr) => {
      core.debug(stdout)

      if (error) {
        core.error(
          `Error executing Python script ${scriptPath}\n${error.message}`
        )
        reject(error)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
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
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    core.debug('Get inputs') // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    const library = core.getInput('library', { required: true })
    const libraryVersion = sanitize(
      core.getInput('library-version', { required: true })
    )
    const modelicaFile = path.resolve(
      core.getInput('modelica-file', { required: true })
    )
    const referenceFiles =
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

    // TODO: Make sure OpenModelica and Python 3 are available

    // Clone OpenModelicaLibraryTesting
    core.debug('clone OpenModelicaLibraryTesting')
    await cloneScripts('cdf827130ce7df206264f673972a691fb469533a')

    // Install Python dependencies
    await installPythonDeps(
      path.join('OpenModelicaLibraryTesting', 'requirements.txt')
    )

    // Generate config
    core.debug('Generating configuration')
    if (!fs.existsSync(modelicaFile)) {
      throw new Error(
        `Can't find file '${modelicaFile}' from input modelica-file: '${core.getInput(
          'modelica-file'
        )}'`
      )
    }
    const confFile = path.resolve(
      path.join('OpenModelicaLibraryTesting', 'configs', `conf-${library}.json`)
    )
    const config = {
      library,
      libraryVersion,
      loadFileCommands: [`loadFile("${modelicaFile}")`],
      referenceFiles,
      referenceFileExtension,
      referenceFileDelimiter
    } as Configuration
    await genConfigFile(confFile, [config])
    core.info(`conf-${library}.json:\n\n${fs.readFileSync(confFile, 'utf-8')}`)

    // Run OpenModelicaLibraryTesting scripts
    const cwd = process.cwd()
    try {
      process.chdir('OpenModelicaLibraryTesting')
      await runPythonScript('test.py', [
        `--branch=${omcVersion}`,
        '--noclean',
        path.join('configs', `conf-${library}.json`)
      ])
      await runPythonScript('report.py', [
        `--branch=${omcVersion}`,
        path.join('configs', `conf-${library}.json`)
      ])
      process.chdir(cwd)
    } catch (error) {
      process.chdir(cwd)
      throw error
    }

    // Write summary
    core.debug('Write summary')
    const overviewFile = path.join(
      'OpenModelicaLibraryTesting',
      `${library}_${libraryVersion}.html`
    )
    const [summary, actionOutputs] = await summaryFromHtmlFile(
      overviewFile,
      pagesRootUrl,
      omcVersion,
      library,
      libraryVersion,
      referenceFiles !== undefined
    )
    await core.summary.addRaw(summary).write()

    core.debug('Set outputs')
    actionOutputs.setOutputs()
    actionOutputs.printInfo()
    actionOutputs.setStatus()

    // Collect HTML files
    core.debug('Collect HTML outputs')
    const htmlArtifactsDir = 'html'
    copyHtmlFilesSync(
      library,
      libraryVersion,
      omcVersion,
      'OpenModelicaLibraryTesting',
      htmlArtifactsDir
    )

    // Upload artifacts
    core.debug('Upload artifacts')
    await uploadArtifacts(
      library,
      path.join('OpenModelicaLibraryTesting', 'sqlite3.db'),
      htmlArtifactsDir,
      omcVersion
    )
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
    throw error
  }
}
