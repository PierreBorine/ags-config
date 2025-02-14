import AstalWp from 'gi://AstalWp';
import { bind } from 'astal';

export default () => {
    const speaker = AstalWp.get_default()?.audio.defaultSpeaker!;

    if (!speaker) {
        throw new Error('Could not find default audio devices.');
    }

    return (
        <box
            className="volume"
            css='min-width: 180px'>

            <button
                tooltipText="Toggle volume"
                onClicked={() => {speaker.mute = !speaker.mute}}>
                <icon icon={bind(speaker, "volumeIcon")} />
            </button>

            <slider
                hexpand
                drawValue = {false}
                onDragged={({value}) => speaker.volume = value}
                value={bind(speaker, 'volume')}
            />
        </box>
    );
}
