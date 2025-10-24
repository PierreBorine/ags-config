import GLib from "gi://GLib";
import { Variable, bind } from "astal";

export default () => {
    const time = Variable(0).poll(1000, 'date "+%s"', (out: string) => parseInt(out));
    const update = Variable({
        is_outdated: false,
        commit_date: 0
    });

    // 1. Test if FLAKE env var is set
    const FLAKE = GLib.getenv("FLAKE");
    if (FLAKE) {
        print("nixpkgs check: $FLAKE is set");
        // 2. Test if flake.lock exists
        if (GLib.file_test(FLAKE + '/flake.lock', GLib.FileTest.EXISTS)) {
            print("nixpkgs check: flake.lock exists");
            print("nixpkgs check: checking for updates...");
            update.poll(
                1800000, // 30 minutes
                ["nixpkgs-update-checker", `nixos-unstable`],
                (out: string) => JSON.parse(out)
            );
        } else print("nixpkgs check: $FLAKE/flake.lock doesn't exist")
    } else print("nixpkgs check: $FLAKE is not set")

    return (
        <button
            class="update"
            tooltipText={bind(time).as(t => {
                const ts = t - update.get().commit_date;
                if (isNaN(ts)) return "A nixpkgs update is available";
                let since = "";
                if (ts < 60) { // For less than a minute
                    since = `${ts} seconds`;
                } else if (ts < 3600) { // For less than an houre
                    since = `${Math.floor(ts/60)} minutes and ${ts % 60} seconds`;
                } else if (ts < 86400) { // For less than a day
                    since = `${Math.floor(ts/3600)} hours and ${Math.floor((ts % 3600) / 60)} minutes`;
                } else if (ts < 172800) { // For less than two days
                    since = `a day and ${Math.floor(ts/3600)} hours`;
                } else since = `${Math.floor(ts/86400)} day(s)`;
                return `A nixpkgs update is available since ${since}`
            })}
            visible={bind(update).as(json => {
                print(`nixpkgs check: checked for updates, got : ${json.is_outdated}`);
                return json.is_outdated;
            })}>
            <icon icon="software-update-available-symbolic" />
        </button>
    );
}
