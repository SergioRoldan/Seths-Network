# Seths Network

Proof-of-concept of [Scalability Issues in the Blockchain] () final grade project by SergioRoldan

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.3.

Tested in Windows 10 with Ganache

## Requirements

[Node] () 9.7.1 or inferior

Nmp 5.6.0 or inferior (new versions of node crash installing the modules, working to fix this)

[Truffle] () 4.0.0 (not tested with other versions)

[Angular] () CLI 1.2 or superior (otherwise change angular.json for angular-cli.json)

[Ganache] () prefered, Geth, Testrpc or similar (use port 7545, Ganache default port, or modify truffle-config.js file to point to another port)

[Electron Packager] () 12.0.1 (not tested with other versions) necessary to pack electron app

## Installation

Clone project using: "#git clone https://github.com/SergioRoldan/Angular6-Truffle-Electron-Dapp-Box.git"

Install modules in the root of the project using: #npm install

Include/modify the next line in the following file, otherwise angular won't compile correctly:

'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js':
    - node: {},
    + node: {crypto:true, stream:true},

This solves Angular 6 strip of crypto and stream libraries, which are truffle-contracts library dependencies

If typings.d.ts is not in the project include it with the following code under the src folder:
    + declare var require: NodeRequire;

This allows node to generate ts typings for js libraries that doesn't provide them

## Configuration

Run under: "#npm run "name""

| Name  | Usage | Script|
| --- | --- | --- |
| ng  | - | "ng" |
| start  | Serve app in localhost:4200 | "ng serve" |
| build  | Build app | "ng build" |
| test  | Run tests | "ng test" |
| lint  | - | "ng lint" |
| e2e  | - | "ng e2e" |
| truffle  | Truffle dev console | "truffle" |
| compile-eth  | Compile smart contracts using Truffle generating build in the process | "truffle compile" |
| migrate-eth  | Compile and deploy smart contract using Truffle to the network specified in truffle-config.js | "truffle migrate" |
| electron  | Start electron | "electron ." |
| electron-build  | Build angular app and serve it with electorn | "ng build --prod && electron ." |
| package-mac  | Package App targeting Mac OS | "electron-packager . --overwrite --platform=darwin --arch=x64 --icon=dist/angular-truffle-dapp/favicon.ico --prune=true --out=release-builds" |
| package-win  | Package App targeting Windows | "electron-packager . seths-network --overwrite --asar=true --platform=win32 --arch=ia32 --icon=dist/angular-truffle-dapp/favicon.ico --prune=true --out=release-builds --version-string.CompanyName=CE --version-string.FileDescription=CE --version-string.ProductName=\"Seths Network\"" |
| create-win-installer | Generate Windows installer | "node installers/windows/createinstaller.js" |
| create-installer-mac | Generate Mac OS installer | "electron-installer-dmg ./release-builds/Seths\\ Network-darwin-x64/Seths\\ Network.app seths-network-app --out=release-builds --overwrite" |
| create-debian-installer | Generate Debian installer | "electron-installer-debian --src release-builds/seths-network-linux-x64/ --arch amd64 --config debian.json" | 

!! create-debian-installer doesn't work on Windows distros because electron-installer-debian can't be installed in not unix OS !!

Revise package.json to check dependencies and other details
Revise angular.json to check angular properties
Revise truffle.config.js to check truffle configuration

- main.js is the entry point for Electron, revise and modify it commenting or uncommenting line according to your requirements

Feel free of revise and modify any configuration file under src folder, most of them remain as default

## Run

In root dir of the project, in order to create build and dist folders and run the app:

- Run Ganache (prefered) or similar (TestRPC, Geth, Parity... allowing RPC calls on port 7545 by default)

- I. To compile and deploy contracts use: "#npm run migrate-eth" or "#truffle migrate" (each time Ganache is relaunched)
- II. Alternatively run: "#npm run compile-eth" or "#truffle compile" and then the previous command (to force contracts compilation and build)

- I. To start the client: "#npm run electron-build"
- II. Alternatively to start the client use "#ng serve", point index.html to localhost:4200 (currently pointing to "./") and then "#npm run electron"
- III. Alternatively run "#npm run electron" once the project is built

- IV.1 Alternatively package the app for your distro using "#npm run package-win", "#npm run package-mac" or "#npm run package-linux"
- IV.1 (Optional) Create the installer for your distro using "#npm run create-installer-mac", "#npm run create-debian-installer" or "#npm run create-win-installer" once the app is packages according to your distro
- IV.2 Use the .exe, .dmg or .pak packaged app in release-builds folder according to your distribution 
(release-builds is created once app is packaged. You can pack the app for any distro using any distro, but the installer creation only will work for your distribution and probably won't for the others, e.g. You must create the Windows installer in a Windows OS, trying to create a macOS installer or Linux installer in a Windows OS fails)

IMPORTANT ! App must be repackaged each time Ganache is restarted because build folder would change. Installer must be also recreated once the app is repackaged. Otherwise, app won't work because is packaged and installed using non currently existent smart contracts. This should be solved when the smart contracts are deployed in Ropsten testnet or Ethereum mainnet.

## Project folder distribution

All important files are selfexplanatory or are commented otherwise.

/build: Folder where Truffle creates artifacts for smart contracs once they are compiled and deployed (Doesn't exist before migration)
/contracts: Contains smart contracts for the Seths Network
/dist: Contains angular-electron app build using production flag (Doens't exist before build)
/e2e: Folder created by angular to contain e2e definitions
/installers: Contains the files required to create windows installer
/migrations: Contains the files required to deploy smart contracts using truffle migrate
/node_modules: Contains node modules (Doesn't exist before npm install)
/release-build: Contains executables of the app packages for Windows, Linux and MacOS & an installer for Windows
/src: Contains the source and configuration files of the application

Also:
- Readme & License
- Configuration files for truffle, debian-installer, angular, typescript, electron and node

## On Development

You will see the address/es of your node, click on any of them to see its contracts (empty if any has been created) or to create a new one. Click on a contract to interact with it.

Contracts should point one of your other accounts to work as expected due to smart contract requirements.

Contracts should be accepted, by the receiver account, to work with them. You can accept, update state, dispute state, request close or unlock funds depending on contract live cycle explained in the TFG paper: [Scalability Issues in the Blockchain] ().

Further features on development.
