{
  description = "Claritas development shell with sops + age + just";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [ age sops just git python3 ];
          shellHook = ''
            export umask_restore="$(umask)"
            umask 077
            mkdir -p env/dec
            chmod 700 env/dec
            echo "Claritas nix shell: sops + age + just (secrets stay in env/enc)"
            if [ -z "''${SOPS_AGE_KEY_FILE:-}" ]; then
              for _k in "''${XDG_CONFIG_HOME:-$HOME/.config}/sops/age/keys.txt" \
                        "$HOME/Library/Application Support/sops/age/keys.txt"; do
                if [ -f "$_k" ]; then export SOPS_AGE_KEY_FILE="$_k"; break; fi
              done
            fi
          '';
        };
      });
}
