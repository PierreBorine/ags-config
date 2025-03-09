import { exec, execAsync } from "astal/process";
import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { Grid, Separator, Spinner } from "../../utils/Astalified";
import { Variable, timeout } from "astal";
import GLib from "gi://GLib";

const { CENTER, FILL } = Gtk.Align;

const wallpapers_path = GLib.get_home_dir() + '/Pictures/Wallpapers/images';
const cache_dir = GLib.get_user_cache_dir() + '/wallpapers-cache';
const transitions = ['any', 'wipe'];
const columnCount = 3;

GLib.mkdir_with_parents(wallpapers_path, 0o755);
GLib.mkdir_with_parents(cache_dir, 0o755);

class File {
    path: string;
    name: string;
    fullPath: string;

    constructor(path: string, name: string) {
        this.path = path;
        this.name = name;
        this.fullPath = path + '/' + name;
    }
}

/*
 * `File` but generates an additional, low-res thumbnail.
 *  has to point to an image.
 */
class Wallpaper extends File {
    thumbnail: string;

    constructor(path: string, name: string) {
        super(path, name);
        this.thumbnail = cache_dir + this.fullPath.slice(wallpapers_path.length);
        this.#genThumbnail();
    }

    async #genThumbnail() {
        if (!GLib.file_test(this.thumbnail, GLib.FileTest.EXISTS)) {
            GLib.mkdir_with_parents(GLib.path_get_dirname(this.thumbnail), 0o755);
            execAsync(`magick "${this.fullPath}" -resize "640x360" "${this.thumbnail}"`).catch(e => print(e));
        }
    }
}

class Dir extends File {
    childs: Wallpaper[];

    constructor(path: string, name: string = "", childs: Wallpaper[] = []) {
        if (name === "") {
            super(GLib.path_get_dirname(path), GLib.path_get_basename(path));
        } else {
            super(path, name);
        }
        this.childs = childs;
    }
}

function readFiles(path: string): string[] {
    return exec(`bash -c "ls '${path}'"`)
        .trim()
        .split("\n")
        .filter(p => p.trim() !== "" && !GLib.file_test(path + '/' + p, GLib.FileTest.IS_DIR));
}

function readDirs(path: string): string[] {
    return exec(`bash -c "ls '${path}'"`)
        .trim()
        .split("\n")
        .filter(p => p.trim() !== "" && GLib.file_test(path + '/' + p, GLib.FileTest.IS_DIR));
}

const wallpaper_dirs: Variable<Dir[]> = Variable([]);
const currentPage = Variable("");
const refreshing = Variable(false);

let wallpapers_sum = "";
function updateWallpapers() {
    refreshing.set(true);

    // only proceed if there are changes in the wallpapers directory
    const new_sum = exec(`bash -c "find '${wallpapers_path}' -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum"`);
    if (new_sum === wallpapers_sum) {
        timeout(200, () => refreshing.set(false));
        return;
    }
    wallpapers_sum = new_sum;

    const subDirsFiles = readDirs(wallpapers_path);
    const subDirs = wallpaper_dirs.get().filter(d => GLib.path_get_basename(wallpapers_path) !== d.name);
    // Handle removed sub-dirs
    subDirs.forEach((d, i) => {
        const still_exists = subDirsFiles.find(fname => fname === d.name);
        if (!still_exists)
            subDirs.splice(i, 1);
    });

    // Handle new sub-dirs
    subDirsFiles.forEach(dname => {
        const is_new = !subDirs.find(wp => dname === wp.name);
        if (is_new)
            subDirs.push(new Dir(wallpapers_path, dname));
    });

    // Make an array with all directrories
    const pre_wallpaper_dirs = [new Dir(wallpapers_path), ...subDirs];

    pre_wallpaper_dirs.forEach(d => {
        const wallsFiles = readFiles(d.fullPath);
        // Handle removed wallpapers
        d.childs.forEach((wp, i) => {
            const still_exists = wallsFiles.find(fname => fname === wp.name);
            if (!still_exists)
                d.childs.splice(i, 1);
        });

        // Handle new wallpapers
        wallsFiles.forEach(fname => {
            const is_new = !d.childs.find(wp => fname === wp.name);
            if (is_new)
                d.childs.push(new Wallpaper(d.fullPath, fname));
        });
    });

    // Apply changes
    wallpaper_dirs.set(pre_wallpaper_dirs);

    timeout(200, () => refreshing.set(false));
}
updateWallpapers();

const mkImage = (wall: Wallpaper) => {
    return (
        <button
            name={wall.name}
            tooltipText={wall.name}
            className="wallpaper"
            onClicked={() => execAsync([
                'swww',
                'img',
                '--transition-type',
                transitions[Math.floor(Math.random()*transitions.length)],
                '--transition-angle',
                Math.floor(Math.random() * 360).toString(),
                '--transition-fps',
                '70',
                wall.fullPath,
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
                    background-image: url("${wall.thumbnail}");
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                `}
            />
        </button>
    );
};

const mkPageBtn = (dirName: string) => {
    return (
        <button
            name={dirName}
            className="pageBtn"
            onClick={() => currentPage.set(dirName)}
            label={dirName}
        />
    )
}

const mkPage = (dirName: string, childs: Wallpaper[]) => {
    return (
        <scrollable
            name={dirName + '-stack'}
            className="page"
            hscroll={Gtk.PolicyType.NEVER}
            halign={FILL}
            valign={FILL}
        >
            <Grid
                hexpand
                halign={CENTER}
                setup={self => {
                    self.get_children().forEach(child => {
                        self.remove(child);
                    });

                    childs.forEach((f, i) => {
                        self.attach(mkImage(f), i % columnCount, Math.floor(i / columnCount), 1, 1);
                    });
                }}
            />
        </scrollable>
    )
}

function hide() {
    App.get_window("wallpapers")!.hide()
}

export default function Wallpapers() {
    const width = Variable(1000)

    return <window
        name="wallpapers"
        namespace="ags-wallpapers"
        visible={false}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        keymode={Astal.Keymode.ON_DEMAND}
        application={App}
        onShow={self => {
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
                <box className="wallpapers" vertical spacing={8}>
                    <box
                        className="header"
                        spacing={8}>
                        <scrollable
                            vscroll={Gtk.PolicyType.NEVER}
                            hexpand
                        >
                            <box
                                spacing={4}
                                setup={self => {
                                    function updateAll(dirs: Dir[]) {
                                        self.get_children().forEach(child => {
                                            self.remove(child);
                                        });

                                        dirs.forEach(d => {
                                            const exists = self.get_children().find(el => el.name === d.name);
                                            if (!exists)
                                                self.add(mkPageBtn(d.name));
                                        });
                                    }

                                    updateAll(wallpaper_dirs.get());
                                    wallpaper_dirs.subscribe(updateAll)
                                }}>
                            </box>
                        </scrollable>
                        <box
                            className="reload">
                            <button
                                visible={refreshing(state => !state)}
                                child={<icon icon="update-symbolic"/>}
                                onClick={updateWallpapers}
                            />
                            <Spinner
                                halign={CENTER}
                                valign={CENTER}
                                visible={refreshing()}
                                active={refreshing()}
                            />
                        </box>
                    </box>
                    <Separator />
                    <stack
                        visibleChildName={currentPage(n => n + '-stack')}
                        transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                        heightRequest={800}
                        setup={self => {
                            function updateAll(dirs: Dir[]) {
                                self.get_children().forEach(child => {
                                    self.remove(child);
                                });

                                dirs.forEach(d => {
                                    const exists = self.get_children().find(el => el.name === (d.name + '-stack'));
                                    if (!exists)
                                        self.add_named(mkPage(d.name, d.childs), d.name + '-stack');
                                });
                            }

                            updateAll(wallpaper_dirs.get());
                            wallpaper_dirs.subscribe(updateAll);
                        }}
                    />
                </box>
                <eventbox expand onClick={hide} />
            </box>
        </box>
    </window>
}
