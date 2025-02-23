import { App } from "astal/gtk3";
import style from "./style.scss";
import Bar from "./widgets/bar/Bar";
import Applauncher from "./widgets/appLauncher/AppLauncher";

import { instanceName, NIXSRC } from "./vars";

import { exec } from "astal/process";
import { monitorFile } from "astal/file";

function updateCSS() {
    exec(["sass", `${SRC}/style.scss`, "/tmp/ags-style.css"]);
    App.reset_css();
    App.apply_css("/tmp/ags-style.css");
};

if (SRC === NIXSRC) {
    monitorFile(`${SRC}/widgets/_shared.scss`, updateCSS);
    monitorFile(`${SRC}/widgets/bar/_index.scss`, updateCSS);
    monitorFile(`${SRC}/widgets/appLauncher/_index.scss`, updateCSS);
}

App.start({
    instanceName,
    css: style,
    main() {
        App.get_monitors().map(Bar);
        Applauncher();
    },
})
