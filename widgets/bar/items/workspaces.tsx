import { Gtk, Widget } from 'astal/gtk3';
import { timeout } from "astal/time"
import { Variable } from "astal"

import Hyprland from 'gi://AstalHyprland';
const hyprland = Hyprland.get_default();

export const dispatchWorkspace = (ws: string) => {
    hyprland.message_async(`dispatch workspace ${ws}`, () => {});
};

function sortWorkspaces(array: Array<Widget.Revealer>) {
    return array
        .filter((ws: Widget.Revealer) => Number(ws.name) > 0)
        .sort((a: Widget.Revealer, b: Widget.Revealer) => Number(a.name) - Number(b.name));
}

function Workspace(id: number, name: string, added: boolean = false) {
    return <revealer
        name={id.toString()}
        className={["workspace", added ? "just-added" : ""].join(' ')}
        revealChild={false}
        transitionDuration={500}
        transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
        setup={self => setTimeout(() => self.revealChild = true, 10)}>
        <button
            onClicked={() => dispatchWorkspace(id.toString())}
            setup={self => {
                const updateActive = () => self.toggleClassName('active', hyprland.get_focused_workspace().id === id);
                updateActive();
                self.hook(hyprland, 'notify::focused-workspace', updateActive);
            }}
            label={name}>
        </button>
    </revealer>
}

export default () => {
    const workspaces = Variable(
        hyprland.get_workspaces()
            // Filter scratchpads out
            .filter((ws: Hyprland.Workspace) => ws.id > 0)
            // Sort by id
            .sort((a: Hyprland.Workspace, b: Hyprland.Workspace) => a.id - b.id)
            .map((ws: Hyprland.Workspace) => Workspace(ws.id, ws.name))
    );

    return <box
        className="workspaces"
        children={workspaces()}
        setup={self => {
            self.hook(hyprland, 'workspace-added', (_, ws) => {
                if (ws.id > 0) {
                    const final = [...workspaces.get(), Workspace(ws.id, ws.name, true)];
                    workspaces.set(sortWorkspaces(final));
                }
            });
            self.hook(hyprland, 'workspace-removed', (_, id) => {
                if (id > 0) {
                    // Trigger hide animation on removed workspace
                    workspaces.get().find((w: Widget.Revealer) => Number(w.name) === id).revealChild = false;
                    // Wait for animation end then filter it out
                    timeout(200, () => {
                        workspaces.set([...workspaces.get()].filter(w => Number(w.name) !== id));
                    });
                }
            });
        }}
    />
};
