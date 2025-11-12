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
exports.Configuration = void 0;
exports.genConfigFile = genConfigFile;
const fsPromise = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
class Configuration {
    library;
    libraryVersion;
    libraryVersionNameForTests;
    libraryVersionLatestInPackageManager;
    extraLibraries;
    ignoreModelPrefix;
    referenceFileExtension;
    referenceFileNameDelimiter;
    referenceFileNameExtraName;
    referenceFinalDot;
    referenceFiles;
    allReferenceFilesExist;
    simCodeTarget;
    ulimitOmc;
    ulimitExe;
    ulimitMemory;
    optlevel;
    alarmFlag;
    abortSlowSimulation;
    loadFileCommands;
    extraCustomCommands;
    environmentSimulation;
    configExtraName;
    constructor(config) {
        this.library = config.library;
        this.libraryVersion = config.libraryVersion;
        this.libraryVersionNameForTests = config.libraryVersionNameForTests;
        this.libraryVersionLatestInPackageManager =
            config.libraryVersionLatestInPackageManager;
        this.extraLibraries = config.extraLibraries;
        this.ignoreModelPrefix = config.ignoreModelPrefix;
        this.referenceFileExtension = config.referenceFileExtension;
        this.referenceFileNameDelimiter = config.referenceFileNameDelimiter;
        this.referenceFileNameExtraName = config.referenceFileNameExtraName;
        this.referenceFinalDot = config.referenceFinalDot;
        this.referenceFiles = config.referenceFiles;
        this.allReferenceFilesExist = config.allReferenceFilesExist;
        this.simCodeTarget = config.simCodeTarget;
        this.ulimitOmc = config.ulimitOmc;
        this.ulimitExe = config.ulimitExe;
        this.ulimitMemory = config.ulimitMemory;
        this.optlevel = config.optlevel;
        this.alarmFlag = config.alarmFlag;
        this.abortSlowSimulation = config.abortSlowSimulation;
        if (os.platform() === 'win32') {
            // Replace \ with / and C: with /c/
            this.loadFileCommands =
                config.loadFileCommands?.map(command => command
                    .replace(/"([a-zA-Z]:\\)/i, match => `"${match[1].toUpperCase()}:/`)
                    .replace(/\\/g, '/')) ?? [];
        }
        else {
            this.loadFileCommands = config.loadFileCommands;
        }
        this.extraCustomCommands = config.extraCustomCommands;
        this.environmentSimulation = config.environmentSimulation;
        this.configExtraName = config.configExtraName;
    }
}
exports.Configuration = Configuration;
/**
 * Generate OpenModelicaLibraryTesting configuration file.
 *
 * @param file            Path to configuration file.
 *                        If a file descriptor is provided, the underlying file will not be closed automatically.
 * @param configurations  Array of configurations for Modelica libraries.
 */
async function genConfigFile(file, configurations) {
    await fsPromise.mkdir(path.dirname(file), { recursive: true });
    await fsPromise.writeFile(file, JSON.stringify(configurations, null, 2));
}
//# sourceMappingURL=config.js.map