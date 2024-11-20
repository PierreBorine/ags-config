#!/bin/sh

commit_feed=$(curl -sf "https://github.com/NixOS/nixpkgs/commits/nixos-unstable.atom")

if [ -z "$commit_feed" ]; then
  echo "false"
  exit
fi

# get the latest commits
latest_revs=$(echo "$commit_feed" \
  | xml2 \
  | grep -m 1 '/feed/entry/id' \
)

# get the latest commit hash
latest=$(echo "$latest_revs" \
  | cut -d '=' -f 2 \
  | cut -d '/' -f 2 \
)

# Read the flake.lock file and extract the current nixpkgs revisions
current_revs=$(jq -r '.nodes | with_entries(select(.key | test("nixpkgs_?[1-9]*\\d*"))) | .[] | .locked.rev' "$FLAKE/flake.lock")

update_available="false"
# If none of the hashes matche, an update is available
if echo "$current_revs" | grep -qv "^$latest$"; then
  update_available="true"
fi

# "true" => update available
# "false" => up-to-date
echo $update_available
