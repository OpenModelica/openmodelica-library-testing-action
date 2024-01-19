import * as child_process from 'child_process'
import * as core from '@actions/core'

/**
 * Install Python requirements.
 *
 * @param requirementsFile  Path to 'requirements.txt' file.
 * @returns                 Promise resolving when pip process exits.
 */
export async function installPythonDeps(
  requirementsFile: string
): Promise<{ stdout: string; stderr: string }> {
  const command = `pip install -r ${requirementsFile}`

  return new Promise((resolve, reject) => {
    child_process.exec(command, (error, stdout, stderr) => {
      core.debug(stdout)

      if (error) {
        core.error('Failed installing Python dependencies')
        reject(error)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}
