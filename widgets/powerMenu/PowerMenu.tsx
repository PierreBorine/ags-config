import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { Variable, bind, execAsync } from "astal";
import { CenterBox } from "astal/gtk3/widget";
import Wp from "gi://AstalWp";

import ControlCenterMenu from "../../services/ControlCenter";
import BarHoverState from "../../services/BarHoverState";
import ControlCenterVis from "../../services/ModuleVis";

import { PlaybackMenu } from "./SysutilsMenus/AudioMenu";
import { DevicesMenu } from "./SysutilsMenus/AudioMenu";
import { BluetoothMenu } from "./SysutilsMenus/BluetoothMenu";
import { getIcon } from "./SysutilsMenus/AudioMenu/Sliders/utils";

const execClose = (command: string[]) => {
		App.get_window("astal-PowerMenu")!.hide();
		execAsync(command);
};

function PowButtons() {
	return (
		<box hexpand halign={Gtk.Align.END} className="PowButtonsBox">
			<button tooltipText="Shutdown" onClicked={() => execClose(["systemctl", "poweroff"])}>
					<icon icon="system-shutdown-symbolic" />
			</button>
			<button tooltipText="Reboot" onClicked={() => execClose(["systemctl", "reboot"])}>
					<icon icon="arrow-circular-top-left-symbolic" />
			</button>
			<button tooltipText="Logout" onClicked={() => execClose(["loginctl", "terminate-user", "$USER"])}>
					<icon icon="application-exit-symbolic" />
			</button>
			<button tooltipText="Lock" onClicked={() => execClose(["loginctl", "lock-session"])}>
					<icon icon="system-lock-screen-symbolic" />
			</button>
			<button tooltipText="Wallpapers" onClicked={() => {
					App.get_window("astal-PowerMenu")!.hide();
					App.get_window("wallpapers")!.show()
			}}>
					<icon icon="preferences-desktop-wallpaper-symbolic" />
			</button>
		</box>
	);
}

function AudioNBrite() {
	const speaker = Wp.get_default()?.audio.defaultSpeaker!;
	const mic = Wp.get_default()?.audio.defaultMicrophone!;

	const speakerIconBinding = Variable.derive(
		[bind(speaker, "volume"), bind(speaker, "mute")],
		(volume, isMuted) => {
			const iconType = "spkr";

			const effectiveVolume = volume > 0 ? volume : 100;
			const mutedState = volume > 0 ? isMuted : true;

			return getIcon(effectiveVolume, mutedState)[iconType];
		},
	);
	const micIconBinding = Variable.derive(
		[bind(mic, "volume"), bind(mic, "mute")],
		(volume, isMuted) => {
			const iconType = "mic";

			const effectiveVolume = volume > 0 ? volume : 100;
			const mutedState = volume > 0 ? isMuted : true;

			return getIcon(effectiveVolume, mutedState)[iconType];
		},
	);

	return (
		<box vertical className="AudioNBriteBox">
			<box className="slider">
				<button
					className="AudioButton"
					onClick={() => speaker.mute = !speaker.mute}
					onDestroy={() => speakerIconBinding.drop()}
				>
					<icon icon={speakerIconBinding()} />
				</button>
				<slider
					hexpand
					onDragged={({value}) => (speaker.volume = value)}
					value={bind(speaker, "volume")}
				/>
			</box>
			<box className="slider">
				<button
					className="AudioButton"
					onClick={() => {
						mic.mute = !mic.mute;
					}}
					onDestroy={() => {
						micIconBinding.drop();
					}}
				>
					<icon icon={micIconBinding()} />
				</button>
				<slider
					hexpand
					onDragged={({value}) => (mic.volume = value)}
					value={bind(mic, "volume")}
				/>
			</box>
		</box>
	);
}

function ControlCenter() {
	const menu = ControlCenterMenu.get_default();

	return (
		<box heightRequest={300}>
			<box vertical css="margin: 4px 0 4px 4px;">
				<button
					className={bind(menu, "bluetooth_menu_class")}
					onClick={() => {
						menu.menu_state = "bluetooth-menu";
					}}
				>
					<box><icon icon="bluetooth-symbolic"/></box>
				</button>
				<button
					className={bind(menu, "playback_menu_class")}
					onClick={() => {
						menu.menu_state = "playback-menu";
					}}
				>
					<box><icon icon="audio-speakers-symbolic"/></box>
				</button>
				<button
					className={bind(menu, "audio_devices_menu_class")}
					onClick={() => {
						menu.menu_state = "audio-devices-menu";
					}}
				>
					<box><icon icon="audio-card-symbolic"/></box>
				</button>
			</box>
			<stack
				hexpand
				name="thingy"
				shown={bind(menu, "menu_state")}
				transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
				setup={self => {
					const topContainer = self.get_children()[0];
					topContainer.className = `${topContainer.className} SysUtilsMenuContainerTop`;
				}}
			>
				<BluetoothMenu />
				<PlaybackMenu />
				<DevicesMenu />
			</stack>
		</box>
	);
}

function PowerMenu() {
	const { TOP, RIGHT, BOTTOM } = Astal.WindowAnchor;
	const hoverState = BarHoverState.get_default();
	const controlCenterState = ControlCenterVis.get_default();
	const revealState = Variable(false);

	return (
		<window
			className="PowerMenu"
			name="astal-PowerMenu"
			namespace="astal-powerMenu"
			application={App}
			keymode={Astal.Keymode.ON_DEMAND}
			exclusivity={Astal.Exclusivity.NORMAL}
			layer={Astal.Layer.TOP}
			anchor={TOP | RIGHT | BOTTOM}
			visible={false}
			onShow={() => {
				// App.get_window("NotificationPopups")!.hide();
				hoverState.bar_state_str = true;
				hoverState.control_center_state = true;
				controlCenterState.control_center_state = true;
				revealState.set(true);
				// setTimeout(() => {
				// 	App.get_window("NotificationPopups")!.show();
				// }, 100);
			}}
			onHide={() => {
				// App.get_window("NotificationPopups")!.hide();
				revealState.set(false);
				hoverState.control_center_state = false;
				hoverState.bar_state_str = false;
				controlCenterState.control_center_state = false;
				// App.get_window("NotificationPopups")!.show();
			}}
			onKeyPressEvent={function (self, event: Gdk.Event) {
				if (event.get_keyval()[1] === Gdk.KEY_Escape) self.hide();
			}}
		>
			<box css="margin: 0px;">
				<CenterBox name="vis" css="margin: 0px;" vertical>
					<box
						vertical
						className="SysutilsContainer"
						halign={Gtk.Align.END}
						valign={Gtk.Align.START}
					>
						<PowButtons/>
						<AudioNBrite/>
						<ControlCenter />
					</box>
				</CenterBox>
			</box>
		</window>
	);
}

export default function PowerButton() {
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
