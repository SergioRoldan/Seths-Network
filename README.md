# AngularTruffleDapp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.3.

Tested in Windows 10

# Requirements

Nmp 5.6.0 or -
Truffle 4.0.0 or +
Ganache, Geth, Testrpc or similar (default port 7545)

Clone project using: #git clone https://github.com/SergioRoldan/Angular6-Truffle-Electron-Dapp-Box.git

Install modules in the root of the project using: #npm install

Include/modify the next line in the file 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js':
    node: {crypto:true, stream:true}

   - This solves Angular 6 strip of crypto and stream libraries, which are truffle-contracts dependencies

## Run

In root dir of the project:

- Run Ganache or similar
- To compile and deploy contracts: #truffle migrate 
- I. To start the client: #npm run electron-build
- II. Alternative to start the client use ng serve, point index.html to localhost:4200 and githen npm run electron
