# AngularTruffleDapp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.3.

Tested in Windows 10 with Ganache

## Requirements

[Node] () 9.7.1 or inferior

Nmp 5.6.0 or inferior (new versions of node crash installing the modules, working to fix this)

[Truffle] 4.0.0 (not tested with other versions)

[Angular] CLI 1.2 or superior (otherwise change angular.json for angular-cli.json)

[Ganache] prefered, Geth, Testrpc or similar (use port 7545, Ganache default port, or modify truffle.js file to point to another port)

[[Electron Packager] () 12.0.1 (not tested with other versions) necessary to pack electron app]

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
| package-linux  | Package App targeting Linux | "electron-packager . seths-network --overwrite --asar=true --platform=linux --arch=x64 --icon=dist/angular-truffle-dapp/favicon.ico --prune=true --out=release-builds" |

Revise package.json to check dependencies and other details
Revise angular.json to check angular properties
Revise truffle.config.js to check truffle configuration

- main.js is the entry point for Electron, revise and modify it commenting or uncommenting line according to your requirements

Feel free of revise and modify any configuration file under src folder, most of them remain as default

## Run

In root dir of the project:

- Run Ganache (prefered) or similar (TestRPC, Geth, Parity... allowing RPC calls)

- I. To compile and deploy contracts use: "#npm run migrate-eth" or "#truffle migrate" (each time Ganache is relaunched)
- II. Alternatively run: "#npm run compile-eth" or "#truffle compile" and then the last command. (to force contracts compilation and build)

- I. To start the client: #npm run electron-build

- II. Alternative to start the client use "#ng serve", point index.html to localhost:4200 (currently pointing to "./") and then "#npm run electron"

## Project folder distribution

## On Development

You will see the address of your node, click on any of them to see its contracts (empty if any has been created) or to create a new one. Click on a contract to interact with it.

Further features on development.
