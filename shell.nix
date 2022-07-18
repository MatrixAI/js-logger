{ pkgs ? import ./pkgs.nix {} }:

with pkgs;
mkShell {
  nativeBuildInputs = [
    nodejs
    gitAndTools.gh
  ];
  shellHook = ''
    echo "Entering $(npm pkg get name)"
    set -o allexport
    . ./.env
    set +o allexport
    set -v

    mkdir --parents "$(pwd)/tmp"

    # Built executables and NPM executables
    export PATH="$(pwd)/dist/bin:$(npm bin):$PATH"

    npm install

    set +v
  '';
}
