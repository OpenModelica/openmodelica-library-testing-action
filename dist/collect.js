"use strict";
/*
 * This file is part of OpenModelica.
 *
 * Copyright (c) 1998-2024, Open Source Modelica Consortium (OSMC),
 * c/o Linköpings universitet, Department of Computer and Information Science,
 * SE-58183 Linköping, Sweden.
 *
 * All rights reserved.
 *
 * THIS PROGRAM IS PROVIDED UNDER THE TERMS OF AGPL VERSION 3 LICENSE OR
 * THIS OSMC PUBLIC LICENSE (OSMC-PL) VERSION 1.8.
 * ANY USE, REPRODUCTION OR DISTRIBUTION OF THIS PROGRAM CONSTITUTES
 * RECIPIENT'S ACCEPTANCE OF THE OSMC PUBLIC LICENSE OR THE GNU AGPL
 * VERSION 3, ACCORDING TO RECIPIENTS CHOICE.
 *
 * The OpenModelica software and the OSMC (Open Source Modelica Consortium)
 * Public License (OSMC-PL) are obtained from OSMC, either from the above
 * address, from the URLs:
 * http://www.openmodelica.org or
 * https://github.com/OpenModelica/ or
 * http://www.ida.liu.se/projects/OpenModelica,
 * and in the OpenModelica distribution.
 *
 * GNU AGPL version 3 is obtained from:
 * https://www.gnu.org/licenses/licenses.html#GPL
 *
 * This program is distributed WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE, EXCEPT AS EXPRESSLY SET FORTH
 * IN THE BY RECIPIENT SELECTED SUBSIDIARY LICENSE CONDITIONS OF OSMC-PL.
 *
 * See the full OSMC Public License conditions for more details.
 *
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyHtmlFilesSync = copyHtmlFilesSync;
exports.uploadArtifacts = uploadArtifacts;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const artifact = __importStar(require("@actions/artifact"));
const github = __importStar(require("@actions/github"));
/**
 * Copy all html files generated from OpenModelicaLibraryTesting into target directory.
 *
 * @param libraryName     Modelica library name
 * @param libraryVersion  Version or ref of Modelica library
 * @param branchOM        OpenModelica version or ref
 * @param omLibTestingDir Root directory of OpenModelicaLibraryTesting
 * @param targetDir       Target directory
 */
function copyHtmlFilesSync(libraryName, libraryVersion, branchOM, omLibTestingDir, targetDir) {
    if (libraryVersion === '') {
        throw new Error('Empty library version string not allowed');
    }
    const libNameBranch = `${libraryName}_${libraryVersion}`;
    if (!fs.existsSync(path.join(targetDir, branchOM, libNameBranch))) {
        fs.mkdirSync(path.join(targetDir, branchOM, libNameBranch), {
            recursive: true
        });
    }
    // Copy files/
    fs.cpSync(path.join(omLibTestingDir, 'files'), path.join(targetDir, branchOM, libNameBranch, 'files'), { recursive: true });
    fs.cpSync(path.join(omLibTestingDir, `${libNameBranch}.html`), path.join(targetDir, branchOM, libNameBranch, `${libNameBranch}.html`));
    // Copy dygraph script
    fs.cpSync(path.join(__dirname, '..', 'scripts', 'dygraph-combined.js'), path.join(targetDir, branchOM, libNameBranch, 'files', 'dygraph-combined.js'));
}
/**
 * Recursively reads a directory and adds absolute file paths to the provided array.
 *
 * @param dirPath The path of the directory to read.
 * @param files   An array to store absolute file paths.
 */
async function readDirectoryRecursive(dirPath, files) {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            await readDirectoryRecursive(entryPath, files);
        }
        else {
            files.push(entryPath);
        }
    }
}
/**
 * Recursively get absolute path of all files inside directory.
 *
 * @param directoryPath Path to directory.
 * @returns             A promise that resolves to an array of absolute file paths.
 */
async function getAllAbsoluteFileNames(directoryPath) {
    const files = [];
    await readDirectoryRecursive(directoryPath, files);
    return files;
}
/**
 * Upload action artifacts.
 *
 * @param sqlFile Path to sqlite3.db
 * @param htmlArtifactsDir Path to directory with all HTML artifacts
 */
async function uploadArtifacts(libraryName, sqlFile, htmlArtifactsDir, omcVersion) {
    const client = new artifact.DefaultArtifactClient();
    const runId = github.context.runId;
    const jobId = github.context.job;
    const runner = `${os.platform()}-${os.arch()}`;
    const htmlFiles = await getAllAbsoluteFileNames(htmlArtifactsDir);
    const htmlPromise = client.uploadArtifact(`${runner}-${omcVersion}-${libraryName}-${runId}-${jobId}.html`, htmlFiles, htmlArtifactsDir);
    const sqlitePromise = client.uploadArtifact(`${runner}-${omcVersion}-sqlite3-${runId}-${jobId}.db`, [sqlFile], path.dirname(sqlFile));
    return Promise.all([htmlPromise, sqlitePromise]);
}
//# sourceMappingURL=collect.js.map