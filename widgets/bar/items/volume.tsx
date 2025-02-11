import WirePlumber from 'gi://AstalWp';
import { bind } from 'astal';

const audio = WirePlumber.get_default().audio;
const speaker = audio.default_speaker;

if (!speaker) {
    throw new Error('Could not find default audio devices.');
}

export default () => <box
    className="volume"
    css='min-width: 180px'>

    <button
        tooltipText="Toggle volume"
        onClicked={() => {speaker.mute = !speaker.mute}}>
        <icon
            icon={bind(speaker, 'volumeIcon').as(icon => {
                return speaker.volume === 0 ? 'audio-volume-muted-symbolic' : icon;
            })}
        />
    </button>

    <slider
        hexpand
        drawValue = {false}
        onDragged={(self) => speaker.volume = self.value}
        value={bind(speaker, 'volume')}
    />
</box>
