import { Gtk } from 'astal/gtk3';

export const NoBluetoothDevices = (): JSX.Element => {
    return (
        <box
            class={'bluetooth-items'}
            vertical
            expand
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
        >
            <label class={'no-bluetooth-devices dim'} hexpand label={'No devices currently found'} />
            <label class={'search-bluetooth-label dim'} hexpand label={"Press '󰑐' to search"} />
        </box>
    );
};
