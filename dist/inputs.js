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
exports.ActionInputs = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
class ActionInputs {
    library;
    libraryVersion;
    modelicaFile;
    referenceFilesDir;
    referenceFileExtension;
    referenceFileNameDelimiter;
    pagesRootUrl;
    omcVersion;
    allowFailingTests;
    constructor(inputs) {
        this.library = inputs.library;
        this.libraryVersion = inputs.libraryVersion;
        this.modelicaFile = inputs.modelicaFile;
        this.referenceFilesDir = inputs.referenceFilesDir;
        this.referenceFileExtension = inputs.referenceFileExtension;
        this.referenceFileNameDelimiter = inputs.referenceFileNameDelimiter;
        this.pagesRootUrl = inputs.pagesRootUrl;
        this.omcVersion = inputs.omcVersion;
        this.allowFailingTests = inputs.allowFailingTests;
    }
    static newFromGitHub() {
        const library = core.getInput('library', { required: true });
        const libraryVersion = sanitize(core.getInput('library-version', { required: true }));
        const modelicaFile = path.resolve(core.getInput('modelica-file', { required: true }));
        const referenceFilesDir = core.getInput('reference-files-dir') !== ''
            ? path.resolve(core.getInput('reference-files-dir'))
            : undefined;
        const referenceFileExtension = core.getInput('reference-files-extension') !== ''
            ? core.getInput('reference-files-extension')
            : undefined;
        const referenceFileDelimiter = core.getInput('reference-files-delimiter') !== ''
            ? core.getInput('reference-files-delimiter')
            : undefined;
        const pagesRootUrl = core.getInput('pages-root-url');
        const omcVersion = core.getInput('omc-version', { required: true });
        const allowFailingTests = strToBool(core.getInput('allow-failing-tests', { required: true }));
        // Check inputs
        if (!fs.existsSync(modelicaFile)) {
            throw new Error(`Can't find file '${modelicaFile}' from input modelica-file: '${core.getInput('modelica-file')}'`);
        }
        // TODO: Check if there are reference files in referenceFilesDir
        if (omcVersion === '') {
            throw new Error("Input 'omc-version' can't be empty");
        }
        return new ActionInputs({
            library,
            libraryVersion,
            modelicaFile,
            referenceFilesDir,
            referenceFileExtension,
            referenceFileNameDelimiter: referenceFileDelimiter,
            pagesRootUrl,
            omcVersion,
            allowFailingTests
        });
    }
}
exports.ActionInputs = ActionInputs;
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
function sanitize(version) {
    return version
        .replace('refs/', '')
        .replace('pull/', 'pr-')
        .replaceAll('/merge', '')
        .replaceAll('/', '-');
}
/**
 * Convert string to boolean.
 *
 * Every version of upper and lower cases of 'true' and '1' are true.
 *
 * @param str String to be converted.
 * @returns Boolean
 */
function strToBool(str) {
    return str.toLowerCase() === 'true' || str === '1';
}
//# sourceMappingURL=inputs.js.map