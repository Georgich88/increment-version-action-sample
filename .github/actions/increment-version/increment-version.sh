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

  prev_version="$1"; release_type="$2"

  if [[ "$prev_version" == "" ]]; then
    echo "could not read previous version"; exit 1
  fi

  possible_release_types="major minor fix"

  if [[ ! ${possible_release_types[*]} =~ ${release_type} ]]; then
    echo "valid argument: [ ${possible_release_types[*]} ]"; exit 1
  fi

  major=0; minor=0; fix=0;

  # break down the version number into it's components
  regex="^([0-9]+).([0-9]+).([0-9]+)$"
  if [[ $prev_version =~ $regex ]]; then
    major="${BASH_REMATCH[1]}"
    minor="${BASH_REMATCH[2]}"
    fix="${BASH_REMATCH[3]}"
  else
    echo "previous version '$prev_version' is not a semantic version"
    exit 1
  fi

  # increment version number based on given release type
  case "$release_type" in
  "major")
    ((++major)); minor=0; fix=0;;
  "minor")
    ((++minor)); fix=0;;
  "fix")
    ((++fix));;
  esac

  next_version="${major}.${minor}.${fix}"
  echo "increment $release_type-release version: $prev_version -> $next_version"

  echo ::set-output name=next-version::"$next_version"
}

main "$1" "$2"
