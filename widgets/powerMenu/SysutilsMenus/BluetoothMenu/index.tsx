import { BluetoothDevices } from "./devices";
import { Header } from "./header";
import { Gtk } from "astal/gtk3";

export const BluetoothMenu = () => {
	return (
		<box
			class="SysUtilsMenuContainer"
			name="bluetooth-menu"
			halign={Gtk.Align.FILL}
			hexpand
			vertical
		>
			<Header />
			<BluetoothDevices />
		</box>
	);
};
