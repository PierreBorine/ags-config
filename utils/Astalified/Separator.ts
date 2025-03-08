import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class Separator extends astalify(Gtk.Separator) {
	static {
		GObject.registerClass(this);
	}

	constructor(props: ConstructProps<Separator, Gtk.Image.ConstructorProps>) {
		super(props as any);
	}
}

export default Separator;
