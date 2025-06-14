ags: pkgs: ({name ? "astal-widgets"}: let
  varsTS = pkgs.writeText "vars.ts" ''
    export const instanceName = "${name}";
    export const NIXSRC = "$nixout/share";
  '';
in
  (ags.lib.bundle {
    inherit pkgs name;
    src = [
      varsTS
      ../icons
      ../services
      ../utils
      ../widgets
      ../app.ts
      ../style.scss
      ../tsconfig.json
    ];
    entry = "app.ts";
    extraPackages = with ags.packages.${pkgs.system};
      [
        hyprland
        tray
        wireplumber
        apps
        bluetooth
      ]
      ++ [
        pkgs.ffmpegthumbnailer
        (pkgs.callPackage ./updateChecker.nix {})
      ];
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
  })
