ags-config
==========

My personal [Ags](https://github.com/Aylur/ags)/[Astal](https://github.com/aylur/astal) configuration

## Running
If using Nix, you can simply run the following command to try it without installing
```Shell
nix run github:PierreBorine/ags-config
```

Otherwise, you can download the config and execute in just like any other ags config
```Shell
git clone https://github.com/PierreBorine/ags-config.git
```

Run `nix develop` first if on Nix.
```Shell
ags run .
```

## Nix Flakes
Add to the inputs
```Nix
ags-config = {
  url = "github:PierreBorine/ags-config";
  inputs.nixpkgs.follows = "nixpkgs";
};
```

### Customize bundles
Example Home Manager config
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

The base16 can also be a custom set of colors
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
> [!NOTE]
> Local `vars.ts` & `_base16.scss` are ignored by the Nix bundler, they are instead re-generated with Nix.
