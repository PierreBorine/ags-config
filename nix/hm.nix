self: {
  config,
  pkgs,
  lib,
  ...
}: let
  inherit (lib) mkEnableOption mkOption mkIf optionals types;
  cfg = config.ags-config;

  agsBundle = self.lib.mkBundle {
    name = cfg.instanceName;
  };
in {
  options.ags-config = {
    enable = mkEnableOption "my Ags widgets config";

    package = mkOption {
      type = types.package;
      default = agsBundle;
      description = "Ags bundle used";
    };

    instanceName = mkOption {
      type = types.str;
      default = "astal-widgets";
      description = "Name for the Astal instance";
    };

    systemd.enable = mkEnableOption "start the config with hyprland using a systemd service";

    hyprland = {
      layerrules = mkEnableOption "layerrules to get the intended look" // {default = true;};
      binds = mkEnableOption "my opinionated binds to toggle some widgets";
    };
  };

  config = mkIf cfg.enable {
    home.packages = [pkgs.ags];

    wayland.windowManager.hyprland = {
      settings = {
        layerrule = optionals cfg.hyprland.layerrules [
          "match:class ^(astal-)(.*)$, blur on, xray on, ignore_alpha 0"
        ];

        # bind = optionals cfg.hyprland.binds [];
      };
    };

    systemd.user.services.ags-config = mkIf cfg.systemd.enable {
      Install.WantedBy = ["hyprland-session.target"];

      Unit = {
        Description = "Astal/Ags desktop shell configuration";
        PartOf = ["hyprland-session.target"];
        After = ["hyprland-session.target"];
      };

      Service = {
        Type = "simple";
        Restart = "on-failure";
        RestartSec = "5s";
        ExecStart = "${lib.getExe cfg.package}";
      };
    };
  };
}
