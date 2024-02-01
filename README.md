# openmodelica-library-testing Action

[![Continuous Integration][ci-badge]][ci-link]
![TS test coverage](badges/coverage.svg)

This GitHub action sets [OpenModelicaLibraryTesting][om-library-testing-link]
scripts up and runs them on a provided Modelica package and returns a summary of
the test report.

The action will set output variables that can be checked how many tests passed
simulation and verification. It will fail if at least one test is failing.

## Inputs

### `library`

Name of Modelica package to test.

### `library-version`

Version of the Modelica package `library` as specified in version
annotation.

> [!NOTE]
> Wrap numbers in `'` to ensure parsing them as strings and not a number.
>
> ```yml
> library-version: '1.0'
> ```

### `modelica-file`

Relative path (from git repository root) to Modelica file containing package to
test.\
Default: `'package.mo'`

### `omc-version`

Version of OpenModelica used for testing.
Add [OpenModelica/setup-openmodelica][setup-openmodelica-link]
to your workflow to setup OpenModelica.\
Default: `'stable'`

### `reference-files-dir`

Relative path (from git repository root) to reference files to compare
simulation results to.\
Default: `''`

### `reference-files-extension`

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
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python 3
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'

      - name: Setup OpenModelica
        uses: OpenModelica/setup-openmodelica@v1
        with:
          version: stable
          packages: |
            omc
          libraries: |
            Modelica 4.0.0
          omc-diff: true

      - uses: OpenModelica/openmodelica-library-testing@v0.1
        with:
          library: 'MyLibrary'
          library-version: '2.2.0'
          modelica-file: 'MyLibrary/package.mo'
          omc-version: 'stable'
          reference-files-dir: 'ReferenceFiles'
          reference-files-extension: 'mat'
          reference-files-delimiter: '.'
          pages-root-url: 'https://USERNAME.github.io/REPOSITORY/'
```

## Outputs

The action will fail if one test fails. In addition the following outputs can be
used to determine the testing results.

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

Download the `MyLibrary.html.zip` artifact, unzip it and start a HTML server to
display the results. This can be used to host results on a server or GitHub
pages.

```bash
unzip MyLibrary.html.zip -d html
python3 -m http.server -d html
```

#### GitHub Pages

It's possible to deploy the test results to GitHub pages. On option

```yml
# [...]
jobs:
  library-testing:
    # [...]

  deploy:
    needs: library-testing
    permissions:
      contents: write
    if: ${{ always() }}
    concurrency: ci-${{ github.ref }} # Recommended if you intend to make multiple deployments in quick succession.
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Get HTML artifact
        uses: actions/download-artifact@v4
        with:
          path: html/
          pattern: '*.html'
          merge-multiple: true

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: html/
          branch: gh-pages
```

### SQlite

For future test the SQlite data base `sqlite3.db` is achieved.

## Demo

This action tests Modelica library [MyLibrary](examples/MyLibrary/package.mo)
consisting of two models from the Modelica Standard Library and compares them to
reference results in [examples/ReferenceFiles](examples/ReferenceFiles) taken
from
[https://github.com/modelica/MAP-LIB_ReferenceResults][map-lib-link].
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
[OpenModelica.github.io/openmodelica-library-testing-action][gh-pages-link].

## License

This action is licensed with the OSMC Public License v1.8, see
[OSMC-License.txt](./OSMC-License.txt).

## Acknowledgments

This package was initially developed by
[Hochschule Bielefeld - University of Applied Sciences and Arts](hsbi.de)
as part of the
[Proper Hybrid Models for Smarter Vehicles (PHyMoS)](https://phymos.de/en/)
project, supported by the German
[Federal Ministry for Economic Affairs and Climate Action][bmwk]
with project number `19|200022G`.

[ci-badge]: https://github.com/OpenModelica/openmodelica-library-testing-action/actions/workflows/ci.yml/badge.svg
[ci-link]: https://github.com/OpenModelica/openmodelica-library-testing-action/actions/workflows/ci.yml
[om-library-testing-link]: https://github.com/OpenModelica/OpenModelicaLibraryTesting
[setup-openmodelica-link]: https://github.com/OpenModelica/setup-openmodelica#available-openmodelica-versions
[map-lib-link]: https://github.com/modelica/MAP-LIB_ReferenceResults/blob/v4.0.0
[gh-pages-link]: https://openmodelica.github.io/openmodelica-library-testing-action/
[bmwk]: https://www.bmwk.de/Navigation/EN/Home/home.html
