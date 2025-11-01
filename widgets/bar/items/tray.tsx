import App from "ags/gtk3/app"
import { Gtk, Gdk } from 'ags/gtk3';
import { createBinding, onCleanup } from 'ags';
import { idle } from 'ags/time';

import AstalTray from 'gi://AstalTray';

const SKIP_ITEMS = ['.spotify-wrapped', 'spotify'];

const TrayItem = (item: AstalTray.TrayItem) => {
    if (item.iconThemePath) {
        App.add_icons(item.get_icon_theme_path());
    }

    return (
        <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
            revealChild={false}
        >
            <menubutton
                class="tray-item"
                // cursor={Gdk.Cursor.new_from_name("pointer", null)}

                usePopover={false}
                tooltipMarkup={createBinding(item, 'tooltipMarkup')}
                menuModel={createBinding(item, 'menuModel')}
                $={self => {
                    self.menuModel = item.menuModel
                    self.insert_action_group("dbusmenu", item.actionGroup)
                    item.connect("notify::action-group", () => {
                      self.insert_action_group("dbusmenu", item.actionGroup)
                    })
                }}
            >
                <icon gicon={createBinding(item, 'gicon')} />
            </menubutton>
        </revealer>
    );
};

export default () => {
    const tray = AstalTray.get_default();

    const itemMap = new Map<string, Gtk.Revealer>();

    return (
        <box
            class="bar-item system-tray"
            visible={createBinding(tray, 'items').as((items) => items.length !== 0)}
            $={self => {
                const id_added = tray.connect('item-added', (_, item: string) => {
                    if (itemMap.has(item) || SKIP_ITEMS.includes(tray.get_item(item).get_title())) {
                        return;
                    }

                    const widget = TrayItem(tray.get_item(item)) as Gtk.Revealer;

                    itemMap.set(item, widget);

                    self.add(widget);

                    idle(() => {
                        widget.set_reveal_child(true);
                    });
                });
                onCleanup(() => tray.disconnect(id_added));

                const removed_id = tray.connect('item-removed', (_, item: string) => {
                    if (!itemMap.has(item)) {
                        return;
                    }

                    const widget = itemMap.get(item);

                    widget?.set_reveal_child(false);

                    setTimeout(() => {
                        widget?.destroy();
                    }, 1000);
                });
                onCleanup(() => tray.disconnect(removed_id));
            }}
        />
    );
};
