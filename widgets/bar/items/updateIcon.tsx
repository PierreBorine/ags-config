import GLib from "gi://GLib"
import { Variable, bind } from "astal";
import { exec } from "astal/process";

const update = Variable("");

// 1. Test if FLAKE env var is set
if (GLib.getenv("FLAKE")) {
    // 2. Test if flake.lock exists
    if (exec('bash -c "[ -f "$FLAKE/flake.lock" ] && echo true"') === 'true') {
        // 1800000 == 30*1000*60 == 30 min
        update.poll(1800000, `bash -c "${SRC}/widgets/bar/items/nixpkgsUpdate.sh"`);
    }
}

export default () => <button
    className="update"
    tooltipText="A nixpkgs update is available"
    visible={bind(update).as(t => t === "true")}>
    <icon icon="software-update-available-symbolic" />
</button>
