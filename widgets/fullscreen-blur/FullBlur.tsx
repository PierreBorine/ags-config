import { App, Astal } from "astal/gtk3";

const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

function hide() {
    App.get_window("ags-full-blur")!.hide();
}

export default function FullBlur() {
    return <window
        name="ags-full-blur"
        namespace="ags-full-blur"
        className="full-blur"
        visible={false}
        exclusivity={Astal.Exclusivity.IGNORE}
        keymode={Astal.Keymode.ON_DEMAND}
        anchor={TOP | BOTTOM | LEFT | RIGHT}
        application={App}
        onKeyPressEvent={hide}>
        <button
            className="blur-btn"
            onClick={hide}
        />
    </window>
}
