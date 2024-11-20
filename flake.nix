{
  description = "My Awesome Desktop Shell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    ags,
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
    inherit (nixpkgs.lib) removePrefix;

    mkHex = color: removePrefix "#" color;

    defaultBase16 = {
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
    };

    mkBundle = {
      name,
      src,
      theme,
      base16 ? defaultBase16,
      extraPackages,
    }: let
      finalBase16 =
        if builtins.isNull base16
        then defaultBase16
        else base16;

      _base16 = with finalBase16;
        pkgs.writeText "_base16.scss" ''
          $base00: #${mkHex base00};
          $base01: #${mkHex base00};
          $base02: #${mkHex base00};
          $base03: #${mkHex base00};
          $base04: #${mkHex base00};
          $base05: #${mkHex base00};
          $base06: #${mkHex base00};
          $base07: #${mkHex base00};
          $base08: #${mkHex base00};
          $base09: #${mkHex base00};
          $base0A: #${mkHex base00};
          $base0B: #${mkHex base00};
          $base0C: #${mkHex base00};
          $base0D: #${mkHex base00};
          $base0E: #${mkHex base00};
          $base0F: #${mkHex base00};
        '';

      vars = pkgs.writeText "vars.ts" ''
        export const themeName = "${theme}";
        export const instanceName = "${name}";
      '';
    in
      (ags.lib.bundle {
        inherit pkgs name extraPackages;
        src =
          [
            vars
            _base16
          ]
          ++ src;
        entry = "app.ts";
      })
      .overrideAttrs {
        unpackPhase = ''
          for srcFile in $src; do
            cp -r $srcFile $(stripHash $srcFile)
          done
        '';
      };
  in {
    lib = {
      mkBar = {
        name ? "ags-bar",
        theme ? "Hyalos",
        base16 ? null,
      }:
        mkBundle {
          inherit name theme base16;

          src = [
            ./widgets
            ./app.ts
            ./style.scss
            ./tsconfig.json
          ];

          extraPackages = with ags.packages.${pkgs.system}; [
            hyprland
            tray
            wireplumber
          ];
        };
    };

    packages.${system} = {
      bar = self.lib.mkBar {};

      # For `nix build` & `nix run`
      default = self.lib.mkBar {name = "ags-bar-test";};
    };

    devShells.${system} = {
      default = pkgs.mkShell {
        buildInputs = [
          ags.packages.${pkgs.system}.agsFull
        ];
      };
    };
  };
}
