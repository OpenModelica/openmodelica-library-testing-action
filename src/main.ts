import * as fs from 'fs'
import * as path from 'path'
import * as child_process from 'child_process'
import * as core from '@actions/core'

import { cloneScripts } from './clone'
import { copyHtmlFilesSync, uploadArtifacts } from './collect'
import { Configuration, genConfigFile } from './config'
import { installPythonDeps } from './installdeps'
import { ActionInputs } from './inputs'
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
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    core.debug('Get inputs') // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    const inputs = ActionInputs.newFromGitHub()

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
    const confFile = path.resolve(
      path.join(
        'OpenModelicaLibraryTesting',
        'configs',
        `conf-${inputs.library}.json`
      )
    )
    const config = {
      library: inputs.library,
      libraryVersion: inputs.libraryVersion,
      loadFileCommands: [`loadFile("${inputs.modelicaFile}")`],
      referenceFiles: inputs.referenceFilesDir,
      referenceFileExtension: inputs.referenceFileExtension,
      referenceFileDelimiter: inputs.referenceFileDelimiter
    } as Configuration
    await genConfigFile(confFile, [config])
    core.info(
      `conf-${inputs.library}.json:\n\n${fs.readFileSync(confFile, 'utf-8')}`
    )

    // Run OpenModelicaLibraryTesting scripts
    const cwd = process.cwd()
    try {
      process.chdir('OpenModelicaLibraryTesting')
      await runPythonScript('test.py', [
        `--branch=${inputs.omcVersion}`,
        '--noclean',
        path.join('configs', `conf-${inputs.library}.json`)
      ])
      await runPythonScript('report.py', [
        `--branch=${inputs.omcVersion}`,
        path.join('configs', `conf-${inputs.library}.json`)
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
      `${inputs.library}_${inputs.libraryVersion}.html`
    )
    const [summary, actionOutputs] = await summaryFromHtmlFile(
      overviewFile,
      inputs.pagesRootUrl,
      inputs.omcVersion,
      inputs.library,
      inputs.libraryVersion,
      inputs.referenceFilesDir !== undefined
    )
    await core.summary.addRaw(summary).write()

    core.debug('Set outputs')
    actionOutputs.setOutputs()
    actionOutputs.printInfo()
    if (!inputs.allowFailingTests) {
      actionOutputs.setStatus()
    }

    // Collect HTML files
    core.debug('Collect HTML outputs')
    const htmlArtifactsDir = 'html'
    copyHtmlFilesSync(
      inputs.library,
      inputs.libraryVersion,
      inputs.omcVersion,
      'OpenModelicaLibraryTesting',
      htmlArtifactsDir
    )

    // Upload artifacts
    core.debug('Upload artifacts')
    await uploadArtifacts(
      inputs.library,
      path.join('OpenModelicaLibraryTesting', 'sqlite3.db'),
      htmlArtifactsDir,
      inputs.omcVersion
    )
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
    throw error
  }
}
