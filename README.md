# openmodelica-library-testing Action

This GitHub action setups OpenModelicaLibraryTesting scripts and run them on a provided
Modelica package and returns a summary of the test report.

The action will set output variables that can be checked if all test passed.

## Inputs

### `package-name`

Name of Modelica package to test.

### `package-version`

Version of the Modelica package `package-name` as specified in version annotation.

### `modelica-file`

Relative path (from git repository root) to Modelica file containing package to test.\
Default: `'package.mo'`

### `dependencies`

Modelica libraries tested package depends on.\
Default: `''`

#### Example

```yml
dependencies: |
  'Modelica 4.0.0'
```

### `omc-version`

Version of OpenModelica to use for testing.
Check
[AnHeuermann/setup-openmodelica](https://github.com/AnHeuermann/setup-openmodelica#available-openmodelica-versions)
for available versions.\
Default: `'stable'`

### `reference-files-dir`

Relative path (from git repository root) to reference files to compare simulation results to.\
Default: `''`

### `reference-files-format`

File extension of result files.\
Allowed values: `'mat'`, `'csv'`\
Default: `mat`

### `reference-files-delimiter`

Character to separate model names in reference files.
E.g. for `Modelica.Blocks.Examples.PID_Controller.mat` it would be `'.'`\
Default: `'.'`

## Example usage

```yaml
jobs:
  library-testing:
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: openmodelica-library-testing
        with:
          package-name: MyLibrary
          package-version: 2.2
          modelica-file: MyLibrary/package.mo
          dependencies: |
            Modelica 4.0.0
          omc-version: stable
          reference-files-dir: ReferenceFiles
          reference-files-format: mat
          reference-files-delimiter: .
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Outputs

## `simulation-tests-passing`

True if all simulation tests are passing.

## ` n-simulation-passing`

Number of successful simulation tests.

## `verification-tests-passing`

True if all verification tests are passing.

## `n-verification-passing`

Number of successful verification tests.

## Artifacts

### HTML Results

Download the `MyLibrary.html.zip` artifact, unzip it and start a HTML server to display
the results. This can be used to host results on a server or GitHub pages.

```bash
unzip MyLibrary.html.zip -d html
python3 -m http.server -d html
```

### SQlite

For future test the SQlite data base `sqlite3.db` is achieved.
