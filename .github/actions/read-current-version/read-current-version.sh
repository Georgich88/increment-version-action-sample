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
  current_version_file="$1";
  echo $current_version_file
  current_version=$(cat "../../../"$current_version_file"" | grep "ext\.versionNumber = '*'" | head -1 | awk '{ gsub("'\''","");  printf("%s",$3)}')
  echo "*** successfully get current version from file $current_version_file: current_version"
  echo ::set-output name=current-version::"$current_version"
}

main "$1"