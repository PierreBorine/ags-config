import { App, Astal, Gtk, Gdk } from "astal/gtk3";

import Clock from "./items/clock";
import Workspaces from "./items/workspaces";
import Volume from "./items/volume";
import UpdateIcon from "./items/updateIcon";
import Tray from "./items/tray";

import { dispatchWorkspace } from "./items/workspaces";
import { themeName } from '../../vars';
import { getMonitorIndex } from "../utils";

const margin = {
    "Hyalos": 0,
    "System24": 9
};

export default function Bar(gdkmonitor: Gdk.Monitor) {
    return <window
        name='ags-bar'
        namespace={`ags-bar-${getMonitorIndex(gdkmonitor)}`}
        className={['bar', themeName].join(' ')}
        gdkmonitor={gdkmonitor}
        margin={margin[themeName]}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.LEFT
            | Astal.WindowAnchor.RIGHT}
        application={App}>
        <eventbox
            onScroll={(_, e) => dispatchWorkspace(e.delta_y > 0 ? 'e+1' : 'e-1')}>
            <centerbox
                startWidget={<box 
                    className="left"
                    spacing={8}
                    halign={Gtk.Align.START}>
                    <Workspaces />
                </box>}

                centerWidget={<box
                    className="center"
                    spacing={8}>
                    <Clock />
                </box>}

                endWidget={<box
                    className="end"
                    spacing={8}
                    halign={Gtk.Align.END}>
                    <Tray />
                    <UpdateIcon />
                    <Volume />
                </box>} />
        </eventbox>
    </window>
}
