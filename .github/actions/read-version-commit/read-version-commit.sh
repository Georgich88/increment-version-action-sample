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

  version="$1";

  if [[ "$version" == "" ]]; then
    echo "could not read commit for empty version"; exit 1
  fi

  version_commit=$(git rev-list -n 1 v"$version")
  echo "version commit for $version is $version_commit"
  echo ::set-output name=version-commit::"$version_commit"

}

main "$1"
