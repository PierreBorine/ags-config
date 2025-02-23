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
  inputs,
  pkgs,
  lib,
  ...
}: let
  agsName = "ags-widgets";
  agsBundle = inputs.ags-config.lib.mkWidgets {
    name = agsName;
  };

  startAgs = pkgs.writeScript "start-ags" ''
    pkill -f '.${agsName}-wrapped'
    ${lib.getExe agsBundle}
  '';
in {
  home.packages = [inputs.ags-config.inputs.ags.packages.${pkgs.system}.ags];
  wayland.windowManager.hyprland = {
    settings = {
      layerrule = [
        "blur, ^(ags-)(.*)$"
        "ignorezero, ^(ags-)(.*)$"
        "animation popin, ags-launcher"
      ];

      exec = [startAgs];

      bind = [
        "$mainMod, D, exec, ags toggle -i '${agsName}' launcher #apps: Summon the app launcher"
      ];
    };
  };
}
```

> [!NOTE]
> Local `vars.ts` is ignored by the Nix bundler. Instead, it uses one generated with Nix.

## Thanks
To [matt1432](https://git.nelim.org/matt1432/nixos-configs) for sharing such a nice Ags config.
