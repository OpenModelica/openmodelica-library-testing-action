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
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    core.debug('Get inputs') // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    const packageName = core.getInput('package-name', { required: true })
    const packageVersion = core.getInput('package-version', { required: true })
    const modelicaFile = path.resolve(
      core.getInput('modelica-file', { required: true })
    )
    const referenceFilesDir =
      core.getInput('reference-files-dir') !== ''
        ? path.resolve(core.getInput('reference-files-dir'))
        : undefined
    const referenceFilesFormat =
      core.getInput('reference-files-format') !== ''
        ? core.getInput('reference-files-format')
        : undefined
    const referenceFilesDelimiter =
      core.getInput('reference-files-delimiter') !== ''
        ? core.getInput('reference-files-delimiter')
        : undefined
    let pagesRootUrl = core.getInput('pages-root-url')
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
    const confFile = path.join('configs', `conf-${packageName}.json`)
    const config = {
      library: packageName,
      libraryVersion: packageVersion,
      loadFileCommands: [`loadFile("${modelicaFile}")`],
      referenceFiles: referenceFilesDir,
      referenceFileExtension: referenceFilesFormat,
      referenceFileNameDelimiter: referenceFilesDelimiter
    } as Configuration
    genConfigFile(confFile, [config])

    // Run OpenModelicaLibraryTesting scripts
    const cwd = process.cwd()
    try {
      process.chdir('OpenModelicaLibraryTesting')
      await runPythonScript('test.py', [
        `--branch=${omcVersion}`,
        '--noclean',
        confFile
      ])
      await runPythonScript('report.py', [`--branch=${omcVersion}`, confFile])
      process.chdir(cwd)
    } catch (error) {
      process.chdir(cwd)
      throw error
    }

    // Write summary
    core.debug('Write summary')
    const overviewFile = path.join(
      'OpenModelicaLibraryTesting',
      `${packageName}_${packageVersion}.html`
    )
    let libNameBranch: string
    if (packageVersion.endsWith('/merge')) {
      libNameBranch = `${packageName}_dev-pr-${packageVersion.replace(
        '/merge',
        ''
      )}`
    } else {
      libNameBranch = `${packageName}_${packageVersion}`
    }
    if (!pagesRootUrl.endsWith('/ ')) {
      pagesRootUrl = `${pagesRootUrl}/`
    }
    const resultsUrl = `${pagesRootUrl}${omcVersion}/${libNameBranch}/${libNameBranch}.html`
    const [summary, actionOutputs] = await summaryFromHtmlFile(
      overviewFile,
      resultsUrl,
      referenceFilesDir !== undefined
    )
    await core.summary.addRaw(summary).write()

    // Set outputs
    core.debug('Set outputs')
    core.setOutput(
      'simulation-tests-passing',
      actionOutputs.simulationTestsPassing
    )
    core.setOutput('n-simulation-passing', actionOutputs.nSimulationPassing)
    core.setOutput(
      'verification-tests-passing',
      actionOutputs.verificationTestsPassing
    )
    core.setOutput('n-verification-passing', actionOutputs.nVerificationPassing)

    core.info(
      `simulation-tests-passing: ${actionOutputs.simulationTestsPassing}`
    )
    core.info(`n-simulation-passing: ${actionOutputs.nSimulationPassing}`)
    core.info(
      `verification-tests-passing: ${actionOutputs.verificationTestsPassing}`
    )
    core.info(`n-verification-passing: ${actionOutputs.nVerificationPassing}`)

    // Collect HTML files
    core.debug('Collect HTML outputs')
    const htmlArtifactsDir = 'html'
    copyHtmlFilesSync(
      packageName,
      packageVersion,
      omcVersion,
      'OpenModelicaLibraryTesting',
      htmlArtifactsDir
    )

    // Upload artifacts
    core.debug('Upload artifacts')
    await uploadArtifacts(
      packageName,
      path.join('OpenModelicaLibraryTesting', 'sqlite3.db'),
      htmlArtifactsDir,
      omcVersion
    )
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
