import * as fs from 'fs'
import * as path from 'path'
import * as artifact from '@actions/artifact'
import * as github from '@actions/github'

/**
 * Copy all html files generated from OpenModelicaLibraryTesting into target directory.
 *
 * @param libraryName     Modelica library name
 * @param libraryVersion  Version or ref of Modelica library
 * @param branchOM        OpenModelica version or ref
 * @param omLibTestingDir Root directory of OpenModelicaLibraryTesting
 * @param targetDir       Target directory
 */
export function copyHtmlFilesSync(
  libraryName: string,
  libraryVersion: string,
  branchOM: string,
  omLibTestingDir: string,
  targetDir: string
): void {
  if (libraryVersion === '') {
    throw new Error('Empty library version string not allowed')
  }

  if (libraryVersion.endsWith('/merge')) {
    libraryVersion = `dev-pr-${libraryVersion.replace('/merge', '')}`
  }
  const libNameBranch = `${libraryName}_${libraryVersion}`

  if (!fs.existsSync(path.join(targetDir, branchOM, libNameBranch))) {
    fs.mkdirSync(path.join(targetDir, branchOM, libNameBranch), {
      recursive: true
    })
  }

  // Copy files/
  fs.cpSync(
    path.join(omLibTestingDir, 'files'),
    path.join(targetDir, branchOM, libNameBranch, 'files'),
    { recursive: true }
  )

  fs.cpSync(
    path.join(omLibTestingDir, `${libNameBranch}.html`),
    path.join(targetDir, branchOM, libNameBranch, `${libNameBranch}.html`)
  )

  // Copy dygraph script
  fs.cpSync(
    path.join(__dirname, '..', 'scripts', 'dygraph-combined.js'),
    path.join(
      targetDir,
      branchOM,
      libNameBranch,
      'files',
      'dygraph-combined.js'
    )
  )
}

/**
 * Recursively reads a directory and adds absolute file paths to the provided array.
 *
 * @param dirPath The path of the directory to read.
 * @param files   An array to store absolute file paths.
 */
async function readDirectoryRecursive(
  dirPath: string,
  files: string[]
): Promise<void> {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      await readDirectoryRecursive(entryPath, files)
    } else {
      files.push(entryPath)
    }
  }
}

/**
 * Recursively get absolute path of all files inside directory.
 *
 * @param directoryPath Path to directory.
 * @returns             A promise that resolves to an array of absolute file paths.
 */
async function getAllAbsoluteFileNames(
  directoryPath: string
): Promise<string[]> {
  const files: string[] = []
  await readDirectoryRecursive(directoryPath, files)
  return files
}

/**
 * Upload action artifacts.
 *
 * @param sqlFile Path to sqlite3.db
 * @param htmlArtifactsDir Path to directory with all HTML artifacts
 */
export async function uploadArtifacts(
  libraryName: string,
  sqlFile: string,
  htmlArtifactsDir: string,
  omcVersion: string
): Promise<[artifact.UploadArtifactResponse, artifact.UploadArtifactResponse]> {
  const client = new artifact.DefaultArtifactClient()
  const runId = github.context.runId
  const jobId = github.context.job

  const htmlFiles = await getAllAbsoluteFileNames(htmlArtifactsDir)

  const htmlPromise = client.uploadArtifact(
    `${omcVersion}-${libraryName}-${runId}-${jobId}.html`,
    htmlFiles,
    htmlArtifactsDir
  )

  const sqlitePromise = client.uploadArtifact(
    `sqlite3-${runId}.db`,
    [sqlFile],
    path.dirname(sqlFile)
  )

  return Promise.all([htmlPromise, sqlitePromise])
}
