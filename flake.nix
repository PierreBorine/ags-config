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

    mkBundle = import ./nix/mkBundle.nix ags pkgs;
  in {
    lib = {
      inherit mkBundle;
    };

    packages.${system} = {
      nixpkgs-update-checker = pkgs.callPackage ./nix/updateChecker.nix {};

      widgets = self.lib.mkBundle {};

      # For `nix build` & `nix run`
      default = self.lib.mkBundle {name = "ags-widgets-test";};
    };

    devShells.${system} = {
      default = pkgs.mkShell {
        buildInputs = [
          ags.packages.${pkgs.system}.agsFull
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
