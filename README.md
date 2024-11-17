ags-config
==========

My personal [ags](https://github.com/Aylur/ags)/[Astal](https://github.com/aylur/astal) configuration

## Running

This config can be ran using ags.
Run `nix develop` first if on Nix.
```Shell
ags run .
```

or using by Nix:
```Shell
nix run
```

## Using in Nix config

### Flake
Add to flake inputs:
```Nix
ags-config = {
  url = "github:PierreBorine/ags-config";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

### Customize bundles
Example:
```Nix
{
  config,
  inputs,
  pkgs,
  lib,
  ...
}: let
  barName = "ags-bar";
  barBundle = inputs.ags-config.lib.mkBar {
    # Name of the binary and Astal instance.
    name = barName;
    # Name of the javascript variable "themeName"
    # This bar currently has "Hyalos" and "System24"
    theme = "Hyalos";
    # base00 to base0F hex colors.
    # Using Stylix colors here.
    base16 = config.lib.stylix.colors;
  };
in {
  wayland.windowManager.hyprland = {
    settings = {
      exec = [
        "pgrep '.${barName}-wrapped' && pkill '.${barName}-wrapped' ; ${lib.getExe barBundle}"
      ];

      layerrule = [
        "blur, ^(${barName}-)"
        "ignorezero, ^(${barName}-)"
      ];
    };
  };
}
```

The base16 could also be a custom set of colors
```Nix
{
  base00 = "#151718";
  base01 = "#282a2b";
  base02 = "#3B758C";
  base03 = "#41535B";
  base04 = "#43a5d5";
  base05 = "#d6d6d6";
  base06 = "#eeeeee";
  base07 = "#ffffff";
  base08 = "#Cd3f45";
  base09 = "#db7b55";
  base0A = "#e6cd69";
  base0B = "#9fca56";
  base0C = "#55dbbe";
  base0D = "#55b5db";
  base0E = "#a074c4";
  base0F = "#8a553f";
}
```

Local `vars.ts` & `_base16.scss` are ignored by the Nix bundler, they are instead re-generated with Nix.
