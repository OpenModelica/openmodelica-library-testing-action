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
exports.run = run;
const child_process = __importStar(require("child_process"));
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const inputs_1 = require("./inputs");
const clone_1 = require("./clone");
const config_1 = require("./config");
const collect_1 = require("./collect");
const installdeps_1 = require("./installdeps");
const summary_1 = require("./summary");
const get_msys_1 = require("./get-msys");
/**
 * Run Python script.
 *
 * @param scriptPath  Path to Python script.
 * @param args        Arguments of script.
 * @returns           Promise resolving when Python process exits.
 */
async function runPythonScript(scriptPath, args) {
    const command = `python ${scriptPath} ${args.join(' ')}`;
    core.debug(`Running ${command}`);
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout, stderr) => {
            core.debug(stdout);
            if (error) {
                core.error(`Error executing Python script ${scriptPath}\n${error.message}`);
                reject(error);
            }
            else {
                resolve({ stdout, stderr });
            }
        });
    });
}
/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
    try {
        // Get inputs
        core.debug('Get inputs'); // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
        const inputs = inputs_1.ActionInputs.newFromGitHub();
        // TODO: Make sure OpenModelica and Python 3 are available
        // Clone OpenModelicaLibraryTesting
        core.debug('clone OpenModelicaLibraryTesting');
        await (0, clone_1.cloneScripts)('601633f38aa1ad4c8c0f1d313ecc77aa7ee177aa');
        // Install Python dependencies
        await (0, installdeps_1.installPythonDeps)(path.join('OpenModelicaLibraryTesting', 'requirements.txt'));
        // Generate config
        core.debug('Generating configuration');
        const confFile = path.resolve(path.join('OpenModelicaLibraryTesting', 'configs', `conf-${inputs.library}.json`));
        const config = new config_1.Configuration({
            library: inputs.library,
            libraryVersion: inputs.libraryVersion,
            loadFileCommands: [`loadFile("${inputs.modelicaFile}")`],
            referenceFiles: inputs.referenceFilesDir,
            referenceFileExtension: inputs.referenceFileExtension,
            referenceFileNameDelimiter: inputs.referenceFileNameDelimiter
        });
        await (0, config_1.genConfigFile)(confFile, [config]);
        core.info(`conf-${inputs.library}.json:\n\n${fs.readFileSync(confFile, 'utf-8')}`);
        // Run OpenModelicaLibraryTesting scripts
        let msysEnv = '';
        if (os.platform() === 'win32') {
            msysEnv = `--msysEnvironment=${(0, get_msys_1.getMSYS)()}`;
        }
        const cwd = process.cwd();
        try {
            process.chdir('OpenModelicaLibraryTesting');
            const { stdout } = await runPythonScript('test.py', [
                '--verbose',
                `--branch=${inputs.omcVersion}`,
                '--noclean',
                msysEnv,
                path.join('configs', `conf-${inputs.library}.json`)
            ]);
            // Verify that library has tests
            if (stdout.includes('Not executing any tests.')) {
                core.notice(`Ensure that ${inputs.library} has models with experiment annotations.`);
                throw new Error('No tests to execute, aborting.');
            }
            await runPythonScript('report.py', [
                `--branch=${inputs.omcVersion}`,
                path.join('configs', `conf-${inputs.library}.json`)
            ]);
            process.chdir(cwd);
        }
        catch (error) {
            process.chdir(cwd);
            throw error;
        }
        // Write summary
        core.debug('Write summary');
        const overviewFile = path.join('OpenModelicaLibraryTesting', `${inputs.library}_${inputs.libraryVersion}.html`);
        const [summary, actionOutputs] = await (0, summary_1.summaryFromHtmlFile)(overviewFile, inputs.pagesRootUrl, inputs.omcVersion, inputs.library, inputs.libraryVersion, inputs.referenceFilesDir !== undefined);
        await core.summary.addRaw(summary).write();
        core.debug('Set outputs');
        actionOutputs.setOutputs();
        actionOutputs.printInfo();
        if (!inputs.allowFailingTests) {
            actionOutputs.setStatus();
        }
        // Collect HTML files
        core.debug('Collect HTML outputs');
        const htmlArtifactsDir = 'html';
        (0, collect_1.copyHtmlFilesSync)(inputs.library, inputs.libraryVersion, inputs.omcVersion, 'OpenModelicaLibraryTesting', htmlArtifactsDir);
        // Upload artifacts
        core.debug('Upload artifacts');
        await (0, collect_1.uploadArtifacts)(inputs.library, path.join('OpenModelicaLibraryTesting', 'sqlite3.db'), htmlArtifactsDir, inputs.omcVersion);
    }
    catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error)
            core.setFailed(error.message);
    }
}
//# sourceMappingURL=main.js.map