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
exports.getMSYS = getMSYS;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function detectMSYS(msysDir) {
    const possibleEnv = [
        { name: 'MSYS', prefix: 'usr', toolchain: 'gcc', architecture: 'x86_64' },
        {
            name: 'UCRT64',
            prefix: 'ucrt64',
            toolchain: 'gcc',
            architecture: 'x86_64'
        },
        {
            name: 'CLANG64',
            prefix: 'clang64',
            toolchain: 'llvm',
            architecture: 'x86_64'
        },
        {
            name: 'CLANGARM64',
            prefix: 'clangarm64',
            toolchain: 'llvm',
            architecture: 'aarch64'
        },
        {
            name: 'CLANG32',
            prefix: 'clang32',
            toolchain: 'llvm',
            architecture: 'i686'
        },
        {
            name: 'MINGW64',
            prefix: 'mingw64',
            toolchain: 'gcc',
            architecture: 'x86_64'
        },
        {
            name: 'MINGW32',
            prefix: 'mingw32',
            toolchain: 'gcc',
            architecture: 'i686'
        }
    ];
    const environments = [];
    for (const env of possibleEnv) {
        if (fs.existsSync(path.join(msysDir, env.prefix)) &&
            fs.existsSync(path.join(msysDir, `${env.prefix.toLowerCase()}.exe`))) {
            environments.push(env);
        }
    }
    return environments;
}
/**
 * Get best suitable MSYS environment string.
 *
 * Reads OMDEV and OPENMODELICAHOME environment variables to find msys root
 * directory.
 * Errors if no ucrt64 or mingw64 is found.
 *
 * @returns 'ucrt64' or 'mingw64'
 */
function getMSYS() {
    const omdev = process.env['OMDEV'];
    let env;
    if (omdev !== undefined) {
        env = detectMSYS(path.join(omdev, 'tools', 'msys'));
        if (env.some(msys => msys.name === 'UCRT64')) {
            return 'ucrt64';
        }
        if (env.some(msys => msys.name === 'MINGW64')) {
            return 'mingw64';
        }
    }
    const openModelicaHome = process.env['OPENMODELICAHOME'];
    if (openModelicaHome !== undefined) {
        env = detectMSYS(path.join(openModelicaHome, 'tools', 'msys'));
        if (env.some(msys => msys.name === 'UCRT64')) {
            return 'ucrt64';
        }
        if (env.some(msys => msys.name === 'MINGW64')) {
            return 'mingw64';
        }
    }
    throw new Error('No suitable MSYS environment found.');
}
//# sourceMappingURL=get-msys.js.map