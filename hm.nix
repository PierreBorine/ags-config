self: {
  config,
  pkgs,
  lib,
  ...
}: let
  inherit (lib) mkEnableOption mkOption mkIf types;
  cfg = config.ags-config;

  agsBundle = self.lib.mkWidgets {
    name = cfg.instanceName;
  };

  startAgs = pkgs.writeScript "start-ags" ''
    pkill -f '.${cfg.instanceName}-wrapped'
    ${lib.getExe agsBundle}
  '';
in {
  options.ags-config = {
    enable = mkEnableOption "my Ags widgets config";

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
        layerrule = mkIf cfg.hyprland.layerrules [
          "blur, ^(ags-)(.*)$"
          "ignorezero, ^(ags-)(.*)$"
          "animation popin, ags-launcher"
          "animation slide right, ags-wallpapers"
          # Put the power menu under the bar
          "order 1, ags-powerMenu"
        ];

        exec = mkIf cfg.hyprland.autoStart [startAgs];

        bind = mkIf cfg.hyprland.binds [
          "$mainMod, D, exec, ags toggle -i '${cfg.instanceName}' launcher #apps: Summon the app launcher"
          "$mainMod, M, exec, ags toggle -i '${cfg.instanceName}' ags-powerMenu #utilities: Open the power menu"
        ];
      };
    };
  };
}
