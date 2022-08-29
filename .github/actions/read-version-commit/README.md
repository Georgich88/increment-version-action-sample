# Read version commit action

This is a GitHub action to read commit for a given version.

## Inputs

### `version`

**Required** The version for which. (e.g. 3.12.5)
The version is identified as a tag with format v##.##.#, (e.g. v3.12.5)

## Outputs

### `version-commit`

The incremented version.

## Example usage

```yaml
  - name: "Read Latest Version Commit"
    id: read_version_commit_latest
    uses: ./.github/actions/read-version-commit
    with:
      version: ${{ steps.read_latest_version.outputs.current-version }}
```
