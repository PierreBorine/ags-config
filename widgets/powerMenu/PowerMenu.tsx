import App from "ags/gtk3/app"

export default function PowerButton() {
    return (
        <button
            onClicked={() => App.get_window("wallpapers")!.show()}
            class="powerMenuButton"
            tooltipText="Power Menu">
            <icon icon="nix-snowflake-white-symbolic" />
        </button>
    );
}
