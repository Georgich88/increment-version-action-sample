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

**Required** The GitHub token.

## Outputs

## `deployment-description`

The deployment description.

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm run prepare
```

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
