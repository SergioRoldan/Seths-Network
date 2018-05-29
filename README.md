# AngularTruffleDapp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.3.

Tested in Windows 10 with Ganache

## Requirements

Nmp 5.6.0 or - (new version of node crash installing the modules, working to fix this)

Truffle 4.0.0 or + (not tested with older version)

Ganache, Geth, Testrpc or similar (use port 7545 or modify truffle.js file to point to another port)

## Installation

Clone project using: #git clone https://github.com/SergioRoldan/Angular6-Truffle-Electron-Dapp-Box.git

Install modules in the root of the project using: #npm install

Include/modify the next line in the following file, otherwise angular won't compile correctly:

'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js':
    node: {crypto:true, stream:true}

   - This solves Angular 6 strip of crypto and stream libraries, which are truffle-contracts library dependencies

## Run

In root dir of the project:

- Run Ganache or similar
- To compile and deploy contracts use: #truffle migrate (each time Ganache is relaunched)
- I. To start the client: #npm run electron-build
- II. Alternative to start the client use "#ng serve", point index.html to localhost:4200 (currently pointing to "./") and then "#npm run electron"

## On Development

You will see the address of your node, click on any of them to see its contracts (empty if any has been created) or to create a new one. Click on a contract to interact with it.

Further features on development.
