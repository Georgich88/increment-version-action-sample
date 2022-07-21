#!/bin/bash -l

# active bash options:
#   - stops the execution of the shell script whenever there are any errors from a command or pipeline (-e)
#   - option to treat unset variables as an error and exit immediately (-u)
#   - print each command before executing it (-x)
#   - sets the exit code of a pipeline to that of the rightmost command
#     to exit with a non-zero status, or to zero if all commands of the
#     pipeline exit successfully (-o pipefail)
set -euo pipefail

main() {

  # script variables
  current_version="$1"
  next_version="$2"
  current_version_file="$3"
  timestamp=$(date +'%Y-%m-%d-%H-%M-%S')
  tag="v"$next_version
  release_branch="v""$next_version""-""$timestamp"

  # check out the branch and set user configs
  git checkout "$BRANCH_NAME"
  git checkout -b "$release_branch"
  git config user.name "${GITHUB_ACTOR}"
  git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"

  # set next version
  sed -i -e "s/""$current_version""/""$next_version""/g" "$current_version_file"
  git add "$current_version_file"
  git commit -m "$tag"

  # push new version
  git push -u origin "$release_branch"
  github-cli pr create --title "$tag" --base "$BRANCH_NAME" --head "$release_branch"
  github-cli pr review --approve
  github-cli pr merge --admin --rebase --delete-branch

  # push tag
  git tag -a "$tag" -m "$tag"
  git push origin tag "$tag"

}

main "$1" "$2" "$3"
