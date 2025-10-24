import App from "ags/gtk3/app"
import style from "./style.scss";
import Bar from "./widgets/bar/Bar";
import Wallpapers from "./widgets/wallpapers/Wallpapers";

import { instanceName, NIXSRC } from "./vars";

import { exec } from "ags/process";
import { monitorFile } from "ags/file";

function updateCSS() {
    exec(["sass", `${SRC}/style.scss`, "/tmp/astal-style.css"]);
    App.reset_css();
    App.apply_css("/tmp/astal-style.css");
};

if (SRC === NIXSRC) {
    monitorFile(`${SRC}/widgets/_shared.scss`, updateCSS);
    monitorFile(`${SRC}/widgets/_common.scss`, updateCSS);
    monitorFile(`${SRC}/widgets/bar/_index.scss`, updateCSS);
    monitorFile(`${SRC}/widgets/powerMenu/_index.scss`, updateCSS);
    monitorFile(`${SRC}/widgets/wallpapers/_index.scss`, updateCSS);
}

App.start({
    instanceName,
    css: style,
    icons: `${NIXSRC}/icons`,
    main() {
        App.get_monitors().map(Bar);
        Wallpapers();
    },
})
