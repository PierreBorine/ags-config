```
▄▀█ █▀▀ █▀ ▄▄ ▄▀▀ █▀█ █▄░█ █▀▀ ▀█▀ █▀▀
█▀█ █▄█ ▄█    ▀▄▄ █▄█ █░▀█ █▀░ ▄█▄ █▄█
```
---

My personal [Ags](https://github.com/Aylur/ags)/[Astal](https://github.com/aylur/astal) configuration

> [!WARNING]
> I do not recommend actually using this in your configuration as I may change and break everything at any moment.
>
> You have been warned, have fun !

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

> [!NOTE]
> Local `vars.ts` is ignored by the Nix bundler. Instead, it uses one generated with Nix.

## Thanks
To [matt1432](https://git.nelim.org/matt1432/nixos-configs) for sharing such a nice Ags config.
