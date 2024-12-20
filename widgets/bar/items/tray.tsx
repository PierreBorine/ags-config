import { App, Gdk, Gtk, Widget } from 'astal/gtk3';
import { bind, idle } from 'astal';
import { MOUSE_BUTTON } from '../../utils';

import AstalTray from 'gi://AstalTray';
const Tray = AstalTray.get_default();


const SKIP_ITEMS = ['.spotify-wrapped'];

const TrayItem = (item: AstalTray.TrayItem) => {
    if (item.iconThemePath) {
        App.add_icons(item.iconThemePath);
    }

    const menu = item.create_menu();

    return (
        <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
            revealChild={false}>
            <button
                className="tray-item"
                cursor="pointer"
                tooltipMarkup={bind(item, 'tooltipMarkup')}
                onDestroy={() => menu?.destroy()}
                onClickRelease={(self, event) => {
                    if (event.button === MOUSE_BUTTON.LEFT) item.activate(1, 0);
                    if (event.button === MOUSE_BUTTON.RIGHT)
                        menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null);
                }}>
                <icon gIcon={bind(item, 'gicon')} />
            </button>
        </revealer>
    );
};

export default () => {
    const itemMap = new Map<string, Widget.Revealer>();

    return (
        <box
            className="bar-item system-tray"
            visible={bind(Tray, 'items').as((items) => items.length !== 0)}
            setup={self => {
                self.hook(Tray, 'item-added', (_, item: string) => {
                    if (itemMap.has(item) || SKIP_ITEMS.includes(Tray.get_item(item).title)) {
                        return;
                    }

                    const widget = TrayItem(Tray.get_item(item)) as Widget.Revealer;

                    itemMap.set(item, widget);

                    self.add(widget);

                    idle(() => {
                        widget.set_reveal_child(true);
                    });
                })

                .hook(Tray, 'item-removed', (_, item: string) => {
                    if (!itemMap.has(item)) {
                        return;
                    }

                    const widget = itemMap.get(item);

                    widget?.set_reveal_child(false);

                    setTimeout(() => {
                        widget?.destroy();
                    }, 1000);
                });
            }}
        />
    );
};
