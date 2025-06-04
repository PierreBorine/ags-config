import {
	GObject,
	property,
	register,
} from "astal";

let currentlyHoveringStr = "not_vis";

let controlCenterVis = false;
let applauncherVis = false;

@register({ GTypeName: "BarHoverState" })
export default class BarHoverState extends GObject.Object {
	static instance: BarHoverState;

	static get_default(): BarHoverState {
		if (!BarHoverState.instance) {
			BarHoverState.instance = new BarHoverState();
		}
		return BarHoverState.instance;
	}

	#StackState = "bluetooth-menu";

	@property(String)
	get bar_state_str() {
		return currentlyHoveringStr;
	}

	@property(Boolean)
	get bar_state_bool() {
		return currentlyHoveringStr == "vis" ? false : true;
	}

	@property(Boolean)
	get bar_state_bool_inv() {
		return currentlyHoveringStr == "vis" ? true : false;
	}

	@property(Boolean)
	get control_center_state() {
		return controlCenterVis;
	}

	set bar_state_str(value: boolean) {
		if (!(controlCenterVis || applauncherVis)) {
			currentlyHoveringStr = value ? "vis" : "not_vis";
			this.notify("bar_state_str");
			this.notify("bar_state_bool");
			this.notify("bar_state_bool_inv");
		}
	}

	set control_center_state(value: boolean) {
		controlCenterVis = value;
		this.notify("control_center_state");
	}

	set app_launcher_state(value: boolean) {
		applauncherVis = value;
	}

	constructor() {
		super();
	}
}
BarHoverState;
