{
  writeShellApplication,
  jq,
  curl,
}:
writeShellApplication {
  name = "nixpkgs-update-checker";
  runtimeInputs = [jq curl];
  text =
    # bash
    ''
      # the name of a nixpkgs channel is required
      if [ -z "$1" ]; then
        exit 1
      fi

      # get the latest commit sha from Github
      latest_rev=$(curl -s "https://api.github.com/repos/NixOS/nixpkgs/commits/nixos-unstable?page=1&per_page=1" | jq -r '.sha')

      # Read the flake.lock file and extract the current nixpkgs revisions
      revs=$(jq -r '.nodes | with_entries(select(.key | test("nixpkgs_?[1-9]*\\d*"))) | .[] | .locked.rev' "$FLAKE/flake.lock")

      # NOTE: '{' and '}' needs to be escaped
      commit_date=$(curl -s "https://prometheus.nixos.org/api/v1/query?query=channel_update_time\{channel=\"''${1}\"\}" | jq -r '.data.result.[0].value.[1]')
      result_json="{\"commit_date\": ''${commit_date}}"

      # Match the new revision with the ones in flake.lock
      # then echo the result json
      if echo "$revs" | grep -q "^$latest_rev$"; then
        echo "$result_json" | jq '. + {"is_outdated": false}'
      else
        echo "$result_json" | jq '. + {"is_outdated": true}'
      fi
    '';
}
