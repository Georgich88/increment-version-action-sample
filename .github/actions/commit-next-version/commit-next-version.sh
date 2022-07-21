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
  github_api_url=https://api.github.com/repos"${GITHUB_OWNER}"/"${GITHUB_REPOSITORY}"

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
  echo "$github_api_url"
  echo "${GITHUB_OWNER}"
  echo "$github_api_url"/pulls

  pr_url=$(gh pr create --title "$tag" --base "$BRANCH_NAME" --head "$release_branch")


#  $(curl \
#    -X POST \
#    --url "$github_api_url"/pulls \
#    --header "Accept: application/vnd.github+json" \
#    --header "Authorization: token ${GITHUB_TOKEN}" \
#    -d "{\"title\":\"$tag\",\"head\":\"$release_branch\",\"base\":\"$BRANCH_NAME\"}")
#  echo "PR URL:$pr_url"

  gh pr review --approve
#  curl --X POST \
#    --url "$pr_url/reviews" \
#    --header "authorization: Bearer ${GITHUB_TOKEN}" \
#    --header "Accept: application/vnd.github+json" \
#    -d '{"event":"APPROVE"}'

  gh pr merge --admin --rebase --delete-branch
#  curl \
#    -X PUT \
#    --url "$pr_url"/merge \
#    --header "authorization: Bearer ${GITHUB_TOKEN}" \
#    --header "Accept: application/vnd.github+json" \
#    -d '{"merge_method":"rebase"}'

  # push tag
  git tag -a "$tag" -m "$tag"
  git push origin tag "$tag"

}

main "$1" "$2" "$3"
