#!/usr/bin/env nix-shell
#! nix-shell -i bash --impure
#! nix-shell -p bash cacert curl jq xml2
#! nix-shell -I nixpkgs=https://github.com/NixOS/nixpkgs/archive/ac35b104800bff9028425fec3b6e8a41de2bbfff.tar.gz

commit_feed=$(curl -sf "https://github.com/NixOS/nixpkgs/commits/nixos-unstable.atom")

if [ -z "$commit_feed" ]; then
  echo "false"
  exit
fi

# get the latest commit hash
new_rev=$(echo "$commit_feed" \
  | xml2 \
  | grep -m 1 '/feed/entry/id' \
  | cut -d '=' -f 2 \
  | cut -d '/' -f 2 \
)

# Read the flake.lock file and extract the current nixpkgs revisions
revs=$(jq -r '.nodes | with_entries(select(.key | test("nixpkgs_?[1-9]*\\d*"))) | .[] | .locked.rev' "$FLAKE/flake.lock")

# "true" => update available
# "false" => up-to-date

# Match the new revision with the ones in flake.lock
if echo "$revs" | grep -q "^$new_rev$"; then
  echo "false"
else
  echo "true"
fi
