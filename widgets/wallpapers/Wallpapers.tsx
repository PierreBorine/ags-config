import { exec, execAsync } from "astal/process";

import { App, Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import Grid from "./Grid";
import { Variable } from "astal";
import { interval } from "astal/time";
import { bind } from "astal/binding";

import GLib from "gi://GLib";
const wallpapers_path = GLib.getenv("HOME") + '/.config/wallpapers/images';
let current_dir = wallpapers_path;

class file {
    path: string;
    name: string;
    fullPath: string;
    dir: boolean;
    childs: file[];

    constructor(path: string, name: string) {
        this.path = path;
        this.name = name;
        this.fullPath = path + '/' + name;
        this.dir = exec(`bash -c "if [[ -d '${this.fullPath}' ]]; then echo 'dir'; fi"`) == 'dir';

        this.childs = [];
        if (this.dir)
            this.childs = readDir(this.fullPath);
    }

    // Debuging
    ls() {
        if (this.dir) {
            for (let i=0; i < this.childs.length; i++) {
                this.childs[i].ls();
            }
        } else {
            print(this.name);
        }
    }
}

const readDir = (path: string): file[] => {
    return exec(`bash -c "ls ${path}"`)
        .trim()
        .split("\n")
        .filter((p) => p.trim() !== "")
        .map((filename: string) => new file(path, filename));
}

function hide() {
    App.get_window("wallpapers")!.hide()
}

const { CENTER, FILL } = Gtk.Align;

function getFiles(): file[] {
    return readDir(current_dir);
}

const wallpapersFiles: Variable<file[]> = Variable(getFiles());
const updateFiles = () => {
    wallpapersFiles.set(getFiles());
};

const mkFolderBtn = (dirName: string, path: string) => {
    return (
        <button
            name={dirName}
            className="dirBtn"
            onClick={() => {
                current_dir = path
                updateFiles();
            }}
            label={dirName}
        />
    )
}

const transitions = ['any', 'wipe'];

const mkImage = (file: file) => {
    return (
        <revealer
            name={file.name}
            transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
            revealChild={true}
            className="wallpaper"
        >
            <button
                tooltipText={file.name}
                onClicked={() => execAsync([
                    'swww',
                    'img',
                    '--transition-type',
                    transitions[Math.floor(Math.random()*transitions.length)],
                    '--transition-angle',
                    Math.floor(Math.random() * 360).toString(),
                    '--transition-fps',
                    '70',
                    file.fullPath,
                    '--transition-duration',
                    '2'
                ])}
                widthRequest={250}
                heightRequest={150}
                halign={CENTER}
                valign={CENTER}
            >
                <box
                    className={"image"}
                    halign={FILL}
                    valign={FILL}
                    css={`
                        background-image: url("${file.fullPath}");
                        background-size: cover;
                        background-repeat: no-repeat;
                    `}
                />
            </button>
        </revealer>
    );
};

export default function Wallpapers() {
    const width = Variable(1000)
    const columnCount = 3;

    let wallpapers: Widget.Revealer[] = [];

    return <window
        name="wallpapers"
        namespace="ags-wallpapers"
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        keymode={Astal.Keymode.ON_DEMAND}
        application={App}
        onShow={(self) => {
            width.set(self.get_current_monitor().workarea.width)
        }}
        onKeyPressEvent={function (self, event: Gdk.Event) {
            if (event.get_keyval()[1] === Gdk.KEY_Escape)
                self.hide()
        }}>
        <box>
            <eventbox widthRequest={width()} expand onClick={hide} />
            <box hexpand={false} vertical>
                <eventbox heightRequest={100} onClick={hide} />
                <box className="wallpapers" vertical>
                    <box
                        className="header"
                        setup={(self) => {
                            self.add(mkFolderBtn('Root', wallpapers_path));
                            self.add(<label label="/"/>)

                            const updateAll = () => {
                                wallpapersFiles.get().forEach((f) => {
                                    if (f.dir) {
                                        const currentWp = (self.get_children() as Widget.Revealer[])
                                            .find((wp) => wp.name === f.name);

                                        if (!currentWp) {
                                            self.add(mkFolderBtn(f.name, f.fullPath));
                                            self.add(<label label="/"/>)
                                        }
                                    }
                                });
                            }

                            wallpapersFiles.subscribe(updateAll);
                        }}
                    />
                    <Grid
                        className="grid"
                        hexpand={true}
                        halign={CENTER}
                        setup={(self) => {
                            const updateWallpapers = async () => {
                                self.get_children().forEach((child) => {
                                    self.remove(child);
                                });

                                wallpapersFiles.get().forEach((f, i) => {
                                    if (!f.dir) {
                                        const currentWp = (self.get_children() as Widget.Revealer[])
                                            .find((wp) => wp.name === f.name);

                                        if (!currentWp)
                                            self.attach(mkImage(f), i % columnCount, Math.floor(i / columnCount), 1, 1);
                                    }
                                });
                            };

                            const updateAll = () => {
                                wallpapers = (self.get_children() as Widget.Revealer[])
                                    .filter((wp) => {
                                        return wallpapersFiles.get().find((f) => {
                                            return f.name === wp.name;
                                        });
                                    });
                                updateWallpapers();
                            };

                            updateAll();
                            wallpapersFiles.subscribe(updateAll);
                            interval(5000, updateFiles);
                        }}
                    />
                </box>
                <eventbox expand onClick={hide} />
            </box>
        </box>
    </window>
}
