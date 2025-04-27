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
          "blur, ^(astal-)(.*)$"
          "ignorezero, ^(astal-)(.*)$"
          "xray 1, ^(astal-bar-)(.*)$"
          "animation popin, astal-launcher"
          "animation slide right, astal-wallpapers"
          # Put the power menu under the bar
          "order 1, astal-powerMenu"

          "blur, astal-full-blur"
          "xray 1, astal-full-blur"
          "animation fade, astal-full-blur"
        ];

        exec = optionals cfg.hyprland.autoStart ["pkill ${cfg.instanceName} ; ${lib.getExe cfg.package}"];

        bind = optionals cfg.hyprland.binds [
          "$mainMod, D, exec, ags toggle -i '${cfg.instanceName}' astal-launcher #apps: Summon the app launcher"
          "$mainMod, M, exec, ags toggle -i '${cfg.instanceName}' astal-powerMenu #utilities: Open the power menu"
        ];
      };
    };
  };
}
