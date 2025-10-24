import { Gdk } from "ags/gtk3";

export const MOUSE_BUTTON = Object.freeze({
    LEFT: 1,
    MIDDLE: 2,
    RIGHT: 3
});

export function getMonitorIndex(gdkmonitor: Gdk.Monitor) {
    const n_monitors = gdkmonitor.display.get_n_monitors();
    for (let i=0; i<n_monitors; i++) {
        if (gdkmonitor.display.get_monitor(i) === gdkmonitor)
            return i;
    }
    return 666
}
