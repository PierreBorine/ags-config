import { ActivePlaybacks } from "./Sliders/playbacks";
import { PlaybackDevices } from "./Devices/PlaybackDevices";
import { InputDevices } from "./Devices/InputDevices";

export const PlaybackMenu = () => {
		return (
				<box class="SysUtilsMenuContainer" name="playback-menu" vertical>
						<ActivePlaybacks />
				</box>
		);
};

export const DevicesMenu = () => {
		return (
				<box
						class="SysUtilsMenuContainer"
						name="audio-devices-menu"
						vertical
				>
						<scrollable class="SysUtilsMenuScrollableBox" vexpand>
								<box vertical>
										<label label="Playback Devices" />
										<PlaybackDevices />
										<label label="Input Devices" />
										<InputDevices />
								</box>
						</scrollable>
				</box>
		);
};
