# Commit next version action

This is a GitHub action to replace a current version with the next and commit changes.
During the invocation a new PR is created and merged into the current with `--admin` flag to ignore protected branch 
restrictions.

## Inputs

### `current-version`

**Required** The current version.

### `next-version`

**Required** The next (incremented) version.

### `current-version-file`

**Required** The file where to replace a current version.

## Example usage

```yaml
  - name: Commit next version ${{ steps.increment_version.outputs.next-version }}
    id: commit_next_version
    uses: ./.github/actions/commit-next-version
    with:
      current-version: ${{ steps.read_current_version.outputs.current-version }}
      next-version: ${{ steps.increment_version.outputs.next-version }}
      current-version-file: ${{github.event.inputs.current-version-file}}
    env:
      BRANCH_NAME: ${{ steps.read_current_branch_name.outputs.branch-name }}
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      GITHUB_OWNER: ${{ github.owner }}
      GITHUB_REPOSITORY: ${{ github.repository }}
```

