# Shortcut notification of next version action

Change shortcut labels and create the deployment description

## Inputs

## `branch-name`

**Required** The current branch.

## `current-version`

**Required** The current version.

## `next-version`

**Required** The next (incremented) version.

## `shortcut-token`

**Required** The shortcut token.

## `github-token`

**Required** The github token.

## Outputs

## `deployment-description`

The deployment description.

## Example usage
```yaml
  - name: Shortcut notification for next version ${{ steps.increment_version.outputs.next-version }}
    id: prepare_release_description
    uses: ./.github/actions/shortcut-notify-next-version/
    with:
      branch-name: ${{ steps.read_current_branch_name.outputs.branch-name }}
      current-version: ${{ steps.read_current_version.outputs.current-version }}
      next-version: ${{ steps.increment_version.outputs.next-version }}
      shortcut-token: ${{ secrets.CLUBHOUSE_TOKEN }}
      github-token: ${{ secrets.GITHUB_TOKEN }}
```
