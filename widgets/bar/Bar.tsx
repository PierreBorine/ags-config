import App from "ags/gtk3/app"
import { Astal, Gtk, Gdk } from "ags/gtk3";

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
            <centerbox>
                <box
                    $type="start"
                    class="left"
                    spacing={8}
                    halign={Gtk.Align.START}>
                    <Workspaces />
                </box>

                <box
                    $type="center"
                    class="center"
                    spacing={8}>
                    <Clock />
                </box>

                <box
                    $type="end"
                    class="end"
                    spacing={8}
                    halign={Gtk.Align.END}>
                    <Tray />
                    <UpdateIcon />
                    <PowerMenuBtn />
                </box>
            </centerbox>
        </eventbox>
    </window>
}
