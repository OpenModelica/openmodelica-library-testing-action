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

  // Copy overview
  fs.cpSync(
    path.join(omLibTestingDir, 'overview.html'),
    path.join(targetDir, 'index.html')
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
 * Upload action artifacts.
 *
 * @param sqlFile Path to sqlite3.db
 * @param htmlArtifactsDir Path to directory with all HTML artifacts
 */
export async function uploadArtifacts(
  libraryName: string,
  sqlFile: string,
  htmlArtifactsDir: string
): Promise<[artifact.UploadArtifactResponse, artifact.UploadArtifactResponse]> {
  const client = new artifact.DefaultArtifactClient()
  const runId = github.context.runId

  const htmlFiles = await fs.promises.readdir(htmlArtifactsDir, {
    recursive: true
  })
  for (let index = 0; index < htmlFiles.length; index++) {
    htmlFiles[index] = path.resolve(
      path.join(htmlArtifactsDir, htmlFiles[index])
    )
  }

  const htmlPromise = client.uploadArtifact(
    `${libraryName}-${runId}.html`,
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
