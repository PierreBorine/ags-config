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

    astalPackages = with ags.packages.${system}; [
      io
      astal3 # or astal4 for gtk4
      # notifd apps
      hyprland
      tray
      wireplumber
      bluetooth
    ];

    extraPackages =
      astalPackages
      ++ [
        pkgs.libadwaita
        pkgs.libsoup_3
        pkgs.ffmpegthumbnailer
        self.packages.${system}.nixpkgs-update-checker
      ];
  in {
    lib.mkBundle = {name ? "astal-widgets"}: let
      varsTS = pkgs.writeText "vars.ts" ''
        export const instanceName = "${name}";
        export const NIXSRC = "$nixout/share";
      '';
    in
      pkgs.stdenv.mkDerivation {
        inherit name;

        src = [
          varsTS
          ./icons
          ./services
          ./utils
          ./widgets
          ./app.ts
          ./style.scss
          ./tsconfig.json
        ];

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook3
          gobject-introspection
          ags.packages.${system}.default
        ];

        buildInputs = extraPackages ++ [pkgs.gjs];

        unpackPhase = ''
          for srcFile in $src; do
            cp -r $srcFile $(stripHash $srcFile)
          done
        '';
        patchPhase = ''
          sed -i "s/\$nixout/''${out//\//\\/}/g" vars.ts
        '';

        installPhase = ''
          runHook preInstall

          mkdir -p $out/bin
          mkdir -p $out/share
          cp -r * $out/share
          ags bundle app.ts $out/bin/${name} -d "SRC='$out/share'"

          runHook postInstall
        '';
      };

    packages.${system} = {
      nixpkgs-update-checker = pkgs.callPackage ./nix/updateChecker.nix {};

      widgets = self.lib.mkBundle {};

      # For `nix build` & `nix run`
      default = self.lib.mkBundle {name = "astal-widgets-test";};
    };

    devShells.${system} = {
      default = pkgs.mkShell {
        buildInputs = [
          (ags.packages.${system}.default.override {inherit extraPackages;})
          self.packages.${system}.nixpkgs-update-checker
        ];
      };
    };

    homeManagerModules = {
      default = self.homeManagerModules.ags-config;
      ags-config = import ./nix/hm.nix self;
    };
  };
}
