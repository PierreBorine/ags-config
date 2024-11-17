import { App } from "astal/gtk3"
import style from "./style.scss"
import Bar from "./widgets/bar/Bar"

import { instanceName } from "./vars";

App.start({
    instanceName,
    css: style,
    main() {
        App.get_monitors().map(Bar)
    },
})
