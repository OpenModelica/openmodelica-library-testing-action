# openmodelica-library-testing Action

[![Continuous Integration](https://github.com/AnHeuermann/openmodelica-library-testing-action/actions/workflows/ci.yml/badge.svg)](https://github.com/AnHeuermann/openmodelica-library-testing-action/actions/workflows/ci.yml)

This GitHub action setups [OpenModelicaLibraryTesting](https://github.com/OpenModelica/OpenModelicaLibraryTesting)
scripts and run them on a provided Modelica package and returns a summary of the
test report.

The action will set output variables that can be checked if all test passed.

## Inputs

### `package-name`

Name of Modelica package to test.

### `package-version`

Version of the Modelica package `package-name` as specified in version
annotation.

> [!NOTE]
> Wrap numbers in `'` to ensure parsing them as strings and not a number.
>
> ```yml
> package-version: '1.0'
> ```

### `modelica-file`

Relative path (from git repository root) to Modelica file containing package to
test.\
Default: `'package.mo'`

### `omc-version`

Version of OpenModelica used for testing.
Add [AnHeuermann/setup-openmodelica](https://github.com/AnHeuermann/setup-openmodelica#available-openmodelica-versions)
to your workflow to setup OpenModelica.\
Default: `'stable'`

### `reference-files-dir`

Relative path (from git repository root) to reference files to compare
simulation results to.\
Default: `''`

### `reference-files-format`

File extension of result files.\
Allowed values: `'mat'`, `'csv'`\
Default: `'mat'`

### `reference-files-delimiter`

Character to separate model names in reference files.
E.g. for `Modelica.Blocks.Examples.PID_Controller.mat` it would be `'.'`\
Default: `'.'`

## Example usage

```yaml
jobs:
  library-testing:
    steps:
      - name: Setup Python 3
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
          cache: pip            # caching pip dependencies

      - name: Update pip
        run: |
          pip install --upgrade pip

      - name: Setup OpenModelica
        uses: AnHeuermann/setup-openmodelica@v0.7
        with:
          version: stable
          packages: |
            omc
          libraries: |
            Modelica 4.0.0
          omc-diff: true

      - uses: openmodelica-library-testing@v0.2.0
        id: library-testing
        with:
          package-name: 'MyLibrary'
          package-version: '2.2.0'
          modelica-file: 'MyLibrary/package.mo'
          omc-version: 'stable'
          reference-files-dir: 'ReferenceFiles'
          reference-files-format: 'mat'
          reference-files-delimiter: '.'
          publish-gh-pages: true
          gh-pages-ref: gh-pages
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Outputs

The action will not fail if test fail but will return variables that can be
checked in an additional step in your workflow.

```yml
  - name: Check test results
    shell: bash
    run: |
      echo "simulation-tests-passing: ${{ steps.library-testing.outputs.simulation-tests-passing }}"
      echo "verification-tests-passing: ${{ steps.library-testing.outputs.verification-tests-passing }}"

      if [ "${{ steps.library-testing.outputs.verification-tests-passing }}" == "True" ]; then
        exit 0;
      else
        exit 1;
      fi
```

## `simulation-tests-passing`

`'True'` if all simulation tests are passing, `'False'` otherwise.

## `n-simulation-passing`

Number of successful simulation tests.

## `verification-tests-passing`

`'True'` if all verification tests are passing, `'False'` otherwise.

## `n-verification-passing`

Number of successful verification tests.

## Artifacts

### HTML Results

#### GitHub Pages

Download the `MyLibrary.html.zip` artifact, unzip it and start a HTML server to
display the results. This can be used to host results on a server or GitHub
pages.

```bash
unzip MyLibrary.html.zip -d html
python3 -m http.server -d html
```

### SQlite

For future test the SQlite data base `sqlite3.db` is achieved.

## Demo

This action tests Modelica library [MyLibrary](examples/MyLibrary/package.mo)
consisting of two models from the Modelica Standard Library and compares them to
reference results in [examples/ReferenceFiles](examples/ReferenceFiles) taken
from
[https://github.com/modelica/MAP-LIB_ReferenceResults](https://github.com/modelica/MAP-LIB_ReferenceResults/blob/v4.0.0).
The reference results for MyLibrary.Blocks.Examples.PID_Controller are altered
to check that verification will fail for variables `spring.w_rel`,
`spring.phi_rel`, `inertia1.w` and `inertia1.phi`.

The expected output is:

> ## GitHub Actions Test summary
>
> ### Summary
>
> |    |   Total |   Frontend |   Backend |   SimCode |   Templates |   Compilation |   Simulation |   Verification |
> |---:|--------:|-----------:|----------:|----------:|------------:|--------------:|-------------:|---------------:|
> |  0 |       2 |          2 |         2 |         2 |           2 |             2 |            2 |              1 |
>
> ### Results
>
> |    | Model                                                 | Verified          |   Simulate |   Total buildModel |   Parsing |   Frontend |   Backend |   SimCode |   Templates |   Compile |
> |---:|:------------------------------------------------------|:------------------|-----------:|-------------------:|----------:|-----------:|----------:|----------:|------------:|----------:|
> |  0 | MyLibrary.Blocks.Examples.PID_Controller (sim)        | 0.06 (4/7 failed) |       0.03 |               2.46 |      1.86 |       0.23 |      0.03 |      0.01 |        0.03 |      2.16 |
> |  1 | MyLibrary.Mechanics.MultiBody.Examples.Pendulum (sim) | 0.01 (3 verified) |       0.26 |               3.37 |      1.86 |       0.25 |      0.37 |      0.02 |        0.05 |      2.67 |

The HTML results can be hosted with GitHub Pages, for this example they can be
found at
[https://anheuermann.github.io/openmodelica-library-testing-action](https://anheuermann.github.io/openmodelica-library-testing-action/).
