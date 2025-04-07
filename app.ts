import { App } from "astal/gtk3";
import style from "./style.scss";
import Bar from "./widgets/bar/Bar";
import Applauncher from "./widgets/appLauncher/AppLauncher";
import Wallpapers from "./widgets/wallpapers/Wallpapers";

import { instanceName, NIXSRC } from "./vars";

import { exec } from "astal/process";
import { monitorFile } from "astal/file";
import FullBlur from "./widgets/fullscreen-blur/FullBlur";

function updateCSS() {
    exec(["sass", `${SRC}/style.scss`, "/tmp/ags-style.css"]);
    App.reset_css();
    App.apply_css("/tmp/ags-style.css");
};

if (SRC === NIXSRC) {
    monitorFile(`${SRC}/widgets/_shared.scss`, updateCSS);
    monitorFile(`${SRC}/widgets/_common.scss`, updateCSS);
    monitorFile(`${SRC}/widgets/bar/_index.scss`, updateCSS);
    monitorFile(`${SRC}/widgets/appLauncher/_index.scss`, updateCSS);
    monitorFile(`${SRC}/widgets/wallpapers/_index.scss`, updateCSS);
}

App.start({
    instanceName,
    css: style,
    icons: `${NIXSRC}/icons`,
    requestHandler(request: string, res: (response: any) => void) {
        if (request == "show blur") {
            App.get_window("ags-full-blur")!.show()
            return res("showing full blur")
        }
        if (request == "hide blur") {
            App.get_window("ags-full-blur")!.hide()
            return res("hiding full blur")
        }
        res("Unknown command")
    },
    main() {
        App.get_monitors().map(Bar);
        Applauncher();
        Wallpapers();
        FullBlur();
    },
})
