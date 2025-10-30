import { Gtk } from 'ags/gtk3';
import { timeout } from 'ags/time';
import { createState, onCleanup } from "ags";

import AstalHyprland from 'gi://AstalHyprland';
const Hyprland = AstalHyprland.get_default();

export const dispatchWorkspace = (ws: string) => {
    Hyprland.message_async(`dispatch workspace ${ws}`, () => {});
};

const Workspace = ({ id = 0 }) => {
    return (
        <revealer
            name={id.toString()}
            transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
            class="workspace"
        >
            <eventbox
                // cursor="pointer"

                onClickRelease={() => dispatchWorkspace(id.toString())}
            >
                <centerbox
                    valign={Gtk.Align.CENTER}
                    class="button">
                    <label $type="center" label={id.toString()} />
                </centerbox>
            </eventbox>
        </revealer>
    );
};

export default () => {
    const L_PADDING = 2;
    const WS_WIDTH = 36;

    const [highlightMargin, setHighlightMargin] = createState("");

    const updateHighlight = (self: Gtk.Box) => {
        const currentId = Hyprland.get_focused_workspace().get_id().toString();

        const indicators = ((self.get_parent() as Gtk.Overlay)
            .get_child() as Gtk.Box)
            .get_children() as Gtk.Revealer[];

        const currentIndex = indicators.findIndex((w) => w.name === currentId);

        if (currentIndex >= 0) {
            setHighlightMargin(`margin-left: ${L_PADDING + (currentIndex * WS_WIDTH)}px`);
        }
    };

    const highlight = (
        <box
            class="button active"

            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.START}

            css={highlightMargin}
            $={self => {
                const id = Hyprland.connect('notify::focused-workspace', () => updateHighlight(self));
                onCleanup(() => Hyprland.disconnect(id));
            }}
        />
    ) as Gtk.Box;

    let workspaces: Gtk.Revealer[] = [];

    return (
        <box
            class="bar-item workspaces"
        >
            <overlay
                passThrough
                overlay={highlight}
            >
                <box
                    $={(self) => {
                        const refresh = () => {
                            (self.get_children() as Gtk.Revealer[]).forEach((rev) => {
                                rev.set_reveal_child(false);
                            });

                            workspaces.forEach((ws) => {
                                ws.set_reveal_child(true);
                            });
                        };

                        const updateWorkspaces = () => {
                            Hyprland.get_workspaces().forEach((ws) => {
                                const currentWs = (self.get_children() as Gtk.Revealer[])
                                    .find((ch) => ch.name === ws.get_id().toString());

                                if (!currentWs && ws.get_id() > 0) {
                                    self.add(Workspace({ id: ws.get_id() }));
                                }
                            });

                            // Make sure the order is correct
                            workspaces.forEach((workspace, i) => {
                                (workspace.get_parent() as Gtk.Box)
                                    .reorder_child(workspace, i);
                            });
                        };

                        const updateAll = () => {
                            workspaces = (self.get_children() as Gtk.Revealer[])
                                .filter((ch) => {
                                    return Hyprland.get_workspaces().find((ws) => {
                                        return ws.get_id().toString() === ch.name;
                                    });
                                })
                                .sort((a, b) => parseInt(a.name ?? '0') - parseInt(b.name ?? '0'));

                            updateWorkspaces();
                            refresh();

                            // Make sure the highlight doesn't go too far
                            const TEMP_TIMEOUT = 100;

                            timeout(TEMP_TIMEOUT, () => updateHighlight(highlight));
                        };

                        updateAll();
                        Hyprland.connect('event', updateAll);
                    }}
                />
            </overlay>
        </box>
    );
};
