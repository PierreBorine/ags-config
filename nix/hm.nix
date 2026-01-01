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
      readOnly = true;
    };

    instanceName = mkOption {
      type = types.str;
      default = "astal-widgets";
      description = "Name for the Astal instance";
    };

    hyprland = {
      layerrules = mkEnableOption "layerrules to get the intended look" // {default = true;};
      autoStart = mkEnableOption "start the config with hyprland";
      binds = mkEnableOption "my opinionated binds to toggle some widgets";
    };
  };

  config = mkIf cfg.enable {
    home.packages = [pkgs.ags];
    wayland.windowManager.hyprland = {
      settings = {
        layerrule = optionals cfg.hyprland.layerrules [
          "match:class ^(astal-)(.*)$, blur on, xray on, ignore_alpha 0"
          "match:class astal-wallpapers, animation slide right"
          # Put the power menu under the bar
          "match:class astal-powerMenu, order 1"
        ];

        exec = optionals cfg.hyprland.autoStart ["pkill ${cfg.instanceName} ; ${lib.getExe cfg.package}"];

        bind = optionals cfg.hyprland.binds [
          "$mainMod, M, exec, ags toggle -i '${cfg.instanceName}' astal-powerMenu #utilities: Open the power menu"
        ];
      };
    };
  };
}
