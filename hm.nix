self: {
  config,
  pkgs,
  lib,
  ...
}: let
  inherit (lib) mkEnableOption mkOption mkIf optionals types;
  cfg = config.ags-config;

  agsBundle = self.lib.mkWidgets {
    name = cfg.instanceName;
  };
in {
  options.ags-config = {
    enable = mkEnableOption "my Ags widgets config";

    package = mkOption {
      type = types.package;
      default = agsBundle;
      description = "Ags bundle to use";
    };

    instanceName = mkOption {
      type = types.str;
      default = "ags-widgets";
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
          "blur, ^(ags-)(.*)$"
          "ignorezero, ^(ags-)(.*)$"
          "xray 1, ^(ags-bar-)(.*)$"
          "animation popin, ags-launcher"
          "animation slide right, ags-wallpapers"
          # Put the power menu under the bar
          "order 1, ags-powerMenu"
        ];

        exec = optionals cfg.hyprland.autoStart ["pkill ${cfg.instanceName} ; ${lib.getExe cfg.package}"];

        bind = optionals cfg.hyprland.binds [
          "$mainMod, D, exec, ags toggle -i '${cfg.instanceName}' launcher #apps: Summon the app launcher"
          "$mainMod, M, exec, ags toggle -i '${cfg.instanceName}' ags-powerMenu #utilities: Open the power menu"
        ];
      };
    };
  };
}
