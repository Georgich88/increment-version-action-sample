# Commit next version action

This is a GitHub action to replace a current version with the next and commit changes.

## Inputs

### `current-version`

**Required** The current version.

### `next-version`

**Required** The next (incremented) version.

### `current-version-file`

**Required** The file where to replace a current version.

## Example usage

```yaml
  - name: Increment version ${{ steps.read_current_version.outputs.current-version }}
    id: increment_version
    uses: ./.github/actions/increment-version
    with:
      current-version: ${{ steps.read_current_version.outputs.current-version }}
      version-fragment: ${{ github.event.inputs.version-fragment }} 
```


## input / output Examples

| version-fragment | current-version |   | output        |
| ---------------- | --------------- | - | ------------- |
| major            | 2.11.7          |   | 3.0.0         |
| minor            | 2.11.7          |   | 2.12.0        |
| fix              | 2.11.7          |   | 2.11.8        |


## Example usage
```yaml
  - name: Getting current version
    id: read_current_version
    uses: ./.github/actions/read-current-version/
    with:
      current-version-file: ${{github.event.inputs.current-version-file}}
```
