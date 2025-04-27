import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { exec } from "astal/process";
import { Separator } from "../../../utils/Astalified";
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

function hide() {
    App.get_window("astal-powerMenu")!.hide()
}

function PowerMenu() {
    const execClose = (command: string) => {
        hide();
        exec(['bash', '-c', command]);
    };

    return (
        <window
            className="powerMenu"
            name="astal-powerMenu"
            namespace="astal-powerMenu"
            application={App}
            visible={false}
            keymode={Astal.Keymode.EXCLUSIVE}
            anchor={TOP | BOTTOM | LEFT | RIGHT}
            exclusivity={Astal.Exclusivity.IGNORE}
            // close when click occurs otside of child
            onButtonPressEvent={(self, event) => {
                const [, _x, _y] = event.get_coords();
                const { x, y, width, height } = self
                    .get_child()!
                    .get_allocation();

                const xOut = _x < x || _x > x + width;
                const yOut = _y < y || _y > y + height;

                // clicked outside
                if (xOut || yOut) {
                    self.visible = false;
                }
            }}
            // close when hitting Escape
            onKeyPressEvent={(_, event: Gdk.Event) => {
                if (event.get_keyval()[1] === Gdk.KEY_Escape) {
                    hide();
                }
            }}
        >
            <box
                // make sure click event does not bubble up
                onButtonPressEvent={() => true}
                expand
                valign={Gtk.Align.START}
                halign={Gtk.Align.END}
                marginTop={48}
                marginEnd={0}
            >
                <box className="popup" vertical spacing={4}>
                    <box className="logout-menu">
                        <button tooltipText="Shutdown" onClicked={() => execClose('systemctl poweroff')}>
                            <icon icon="system-shutdown-symbolic" />
                        </button>
                        <button tooltipText="Reboot" onClicked={() => execClose('systemctl reboot')}>
                            <icon icon="arrow-circular-top-left-symbolic" />
                        </button>
                        <button tooltipText="Logout" onClicked={() => execClose('loginctl terminate-user $USER')}>
                            <icon icon="application-exit-symbolic" />
                        </button>
                        <button tooltipText="Lock" onClicked={() => execClose('loginctl lock-session')}>
                            <icon icon="padlock2-symbolic" />
                        </button>
                    </box>
                    <Separator />
                    <box className="utils">
                        <button tooltipText="Wallpapers" onClicked={() => {
                            hide();
                            App.get_window("wallpapers")!.show()
                        }}>
                            <icon icon="preferences-desktop-wallpaper-symbolic" />
                        </button>
                    </box>
                </box>
            </box>
        </window>
    )
}

export default () => {
    const _powerMenu = <PowerMenu />

    return (
        <button
            onClicked={() => _powerMenu.visible = !_powerMenu.visible}
            className="powerMenuButton"
            tooltipText="Power Menu">
            <icon icon="nix-snowflake-white-symbolic" />
        </button>
    );
}
