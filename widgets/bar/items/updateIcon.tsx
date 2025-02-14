import GLib from "gi://GLib"
import { Variable, bind } from "astal";
import { exec } from "astal/process";

import { NIXSRC } from "../../../vars";

export default () => {
    const update = Variable("");

    // 1. Test if FLAKE env var is set
    if (GLib.getenv("FLAKE")) {
        print("nixpkgs check: $FLAKE is set");
        // 2. Test if flake.lock exists
        if (exec('bash -c "[ -f "$FLAKE/flake.lock" ] && echo true"') === 'true') {
            print("nixpkgs check: flake.lock exists");
            // 1800000 == 30*1000*60 == 30 min
            update.poll(1800000, ["bash", `${NIXSRC}/widgets/bar/items/nixpkgsUpdate.sh`]);
        } else {print("nixpkgs check: $FLAKE/flake.lock doesn't exist")}
    } else {print("nixpkgs check: $FLAKE is not set")}

    return (
        <button
            className="update"
            tooltipText="A nixpkgs update is available"
            visible={bind(update).as(t => t == "true")}>
            <icon icon="software-update-available-symbolic" />
        </button>
    );
}
