import { Gtk } from 'astal/gtk3';

export const BluetoothDisabled = (): JSX.Element => {
    return (
        <box
            class={'bluetooth-items'}
            vertical
            expand
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
        >
            <label class={'bluetooth-disabled dim'} hexpand label={'Bluetooth is disabled'} />
        </box>
    );
};
