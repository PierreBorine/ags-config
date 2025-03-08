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

    mkBundle = {
      name,
      src,
      extraPackages,
    }: let
      varsTS = pkgs.writeText "vars.ts" ''
        export const instanceName = "${name}";
        export const NIXSRC = "$nixout/share";
      '';
    in
      (ags.lib.bundle {
        inherit pkgs name extraPackages;
        src = src ++ [varsTS];
        entry = "app.ts";
      })
      .overrideAttrs {
        unpackPhase = ''
          for srcFile in $src; do
            cp -r $srcFile $(stripHash $srcFile)
          done
        '';
        patchPhase = ''
          sed -i "s/\$nixout/''${out//\//\\/}/g" vars.ts
        '';
      };
  in {
    lib = {
      mkWidgets = {name ? "ags-widgets"}:
        mkBundle {
          inherit name;

          src = [
            ./icons
            ./utils
            ./widgets
            ./app.ts
            ./style.scss
            ./tsconfig.json
          ];

          extraPackages = with ags.packages.${pkgs.system}; [
            hyprland
            tray
            wireplumber
            apps
          ];
        };
    };

    packages.${system} = {
      widgets = self.lib.mkWidgets {};

      # For `nix build` & `nix run`
      default = self.lib.mkWidgets {name = "ags-widgets-test";};
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
