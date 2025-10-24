import { App, Astal, Gtk, Gdk } from "astal/gtk3";

import Clock from "./items/clock";
import Workspaces from "./items/workspaces";
import UpdateIcon from "./items/updateIcon";
import Tray from "./items/tray";
import PowerMenuBtn from '../powerMenu/PowerMenu';

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

import { dispatchWorkspace } from "./items/workspaces";
import { getMonitorIndex } from "../../utils";

export default function Bar(gdkmonitor: Gdk.Monitor) {
    return <window
        name='astal-bar'
        namespace={`astal-bar-${getMonitorIndex(gdkmonitor)}`}
        class='bar'
        gdkmonitor={gdkmonitor}
        margin={0}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={App}>
        <eventbox
            onScroll={(_, e) => dispatchWorkspace(e.delta_y > 0 ? 'e+1' : 'e-1')}>
            <centerbox
                startWidget={<box
                    class="left"
                    spacing={8}
                    halign={Gtk.Align.START}>
                    <Workspaces />
                </box>}

                centerWidget={<box
                    class="center"
                    spacing={8}>
                    <Clock />
                </box>}

                endWidget={<box
                    class="end"
                    spacing={8}
                    halign={Gtk.Align.END}>
                    <Tray />
                    <UpdateIcon />
                    <PowerMenuBtn />
                </box>} />
        </eventbox>
    </window>
}
