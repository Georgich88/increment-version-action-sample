# Read current version action

This action reads current version of a project from a given file.   
Version format: `ext.versionNumber=00.00.0`

## Inputs

## `current-version-file`

**Required** The path to project file from which a version should be read.

## Outputs

## `current-version`

The current version.

## Example usage
```yaml
  - name: Getting current version
    id: read_current_version
    uses: ./.github/actions/read-current-version/
    with:
      current-version-file: ${{github.event.inputs.current-version-file}}
```
