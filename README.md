# Seths Network

Proof-of-concept of [Scalability Issues in the Blockchain]s() final grade project by SergioRoldan

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.3.

Tested in Windows 10 with Ganache

## Requirements

[Node](https://nodejs.org/es/) 9.7.1 or inferior

Nmp 5.6.0 or inferior (new versions of node crash installing the modules, working to fix this)

[Truffle](https://truffleframework.com/) 4.0.0 (not tested with other versions)

[Angular](https://angular.io) CLI 1.2 or superior (otherwise change angular.json for angular-cli.json)

[Ganache](http://truffleframework.com/ganache/) prefered, Geth, Testrpc or similar (use port 7545, Ganache default port, or modify truffle-config.js file to point to another port)

[Electron Packager](https://github.com/electron-userland/electron-packager) 12.0.1 (not tested with other versions) necessary to pack electron app

## Installation

Clone project using: "#git clone https://github.com/SergioRoldan/Angular6-Truffle-Electron-Dapp-Box.git"

Install modules in the root of the project using: #npm install

Include/modify the next line in the following file, otherwise angular will throw an error building and serving:

'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js':
    
    - node: {},

    + node: {crypto:true, stream:true},

(this solves Angular 6 strip of crypto and stream libraries, which are truffle-contracts library dependencies)

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

```diff
- !! create-debian-installer and create-installer-mac doesn't work on Windows distros because electron-installer-debian and electron-installer-dmg can't be installed in not unix OS !!
```

All the following json files are configuration files and are considered self explanatory:

- Revise package.json to check node dependencies and other details

- Revise angular.json to check angular cli properties

- Revise truffle-config.js to check truffle configuration

- Revise debian.json if you want to create an installer for the packaged app for Debian systems

- main.js is the entry point for Electron, revise and modify it commenting or uncommenting lines according to your requirements

Feel free of revise and modify any configuration file under src folder, most of them remain as default

## Running

In root dir of the project, in order to create build and dist folders and run the app execute the following in the order stipulated:

- I. Run Ganache (prefered) or similar (TestRPC, Geth, Parity... allowing RPC calls on port 7545, by default)



- II. To compile and deploy contracts use: "#npm run migrate-eth" or "#truffle migrate" (each time Ganache is relaunched)

- II-A1. Alternatively run: "#npm run compile-eth" or "#truffle compile" and then the previous command (to force contracts compilation and build before deployment)



- III. To start the client: "#npm run electron-build"

- III-A1. Alternatively to start the client point index.html to localhost:4200 (currently pointing to "./"), use "#ng serve" and then "#npm run electron" (this allows automatic reload of the app if the code changes)

- III-A2. Alternatively run "#npm run electron" once the project is built ("npm run build")

- III-A3-1. Alternatively package the app for your distro using "#npm run package-win", "#npm run package-mac" or "#npm run package-linux"
- III-A3-Optional. Create the installer for your distro using "#npm run create-installer-mac", "#npm run create-debian-installer" or "#npm run create-win-installer" once the app is packages according to your distro
- III-A3-2. Use the .exe, .dmg or .pak packaged app in release-builds folder according to your distribution 
(release-builds is created once app is packaged. You can pack the app for any distro using any distro, but the installer creation only will work for your distribution and probably won't for the others, e.g. You must create the Windows installer in a Windows OS, trying to create a macOS installer or Linux installer in a Windows OS fails)

```diff
- IMPORTANT !!! Each time ganache is restarted you should delete the database to don't keep inexistent channels, to do so just click on Drop DBs on the configuration screen and relaunch the app, or use dev tools to delete NeDB in applications tab and relaunch the app. To relaunch the app just close it and execute "#npm run electron" or using any of the alternative methods

- IMPORTANT !! App must be repackaged each time Ganache is restarted because is necessary to redeploy the contracts and therefore build folder changes. Installer must be also recreated once the app is repackaged. Otherwise, app won't work because is packaged and installed using non currently existent smart contracts. This will be solved when the smart contracts are deployed in Ropsten testnet or Ethereum mainnet, where factory address is fixed and channels remain even if the node is closed.
```

## Definitions

Services: Angular services are substitutable objects that are wired together using dependency injection (DI). You can use services to organize and share code across your app.

Angular services are:

Lazily instantiated – Angular only instantiates a service when an application component depends on it.

Singletons – Each component dependent on a service gets a reference to the single instance generated by the service factory.

Angular offers several useful services, but for most applications you'll also want to create your own.

- Components: Component decorator allows you to mark a class as an Angular component and provide additional metadata that determines how the component should be processed, instantiated and used at runtime. Components are the most basic building block of an UI in an Angular application. An Angular application is a tree of Angular components. Angular components are a subset of directives. Unlike directives, components always have a template and only one component can be instantiated per an element in a template.

- Modules: Angular defines the NgModule, which differs from and complements the JavaScript (ES2015) module. An NgModule declares a compilation context for a set of components that is dedicated to an application domain, a workflow, or a closely related set of capabilities. An NgModule can associate its components with related code, such as services, to form functional units.

Every Angular app has a root module, conventionally named AppModule, which provides the bootstrap mechanism that launches the application. An app typically contains many functional modules.

The app uses angular and bootstrap styles. 

The app uses angular directives to generate the templates reactively using the MVC model among the ones we can find ngFor, ngIf, {{}} (controller to view binding), [ngModel] (bidirecctional binding between view and controller), [ngClass], [style]...

The app uses angular HTTP, Forms, Browser and Routing modules

Web3 uses events thrown by the smart contract to update the local database and truffle-contracts to interact with this contracts

NeDB is used an indexedDB storing information in the browser

The app uses web3utils for hashing through soliditySha3 to commpute keccak256 hash exactly in the same way than solidity to make sure that the signatures are correctly generated and will be correctly verified

## Project folder distribution

All important files are selfexplanatory or are commented otherwise.

- /build: Folder where Truffle creates artifacts for smart contracs once they are compiled and deployed (Doesn't exist before migration)
    - /contracts/nameOfTheContract.json: Each of the artifacts of a smart contract including abi, bytecode and abstraction of its

- /contracts: Contains smart contracts for the Seths Network
    - /libraries/CryptoHandler.sol: Library to handle some cryptographical functions required by the other smart contracts
    - Migrations.sol: Migrations smart contract used by Truffle to keep the version of the rest of the contracts
    - Factory.sol: Includes Factory, ChannelFinal, Modifiers, Multiownable and Expirable smart contracts
        - Expirable: Defines channel live cycle and time restrictions
        - Multiownable: Defines channel two owners and restrict the access to the channel
        - Modifiers: Defines requirements and events related with the close, accept and dispute of a channel
        - ChannelFinal: Defines the operation of a state channel and inherits from the previous 3 smart contracts
        - Factory: Defines the main and public contract of the Seths Network capable of creating channels

- /discarted_contracts: Contains smart contracts discarted during the development of the network
    - Channel.sol: Non-forwarding channel, first step of the ChannelFinal contract
    - ChannelExtension.sol: Extension to the previous channel to make it able to forward transactions, previous to ChannelFinal
    - Test.sol: Used to test the two previous contracts for security, efficieny and correct operation

- /dist: Contains angular-electron app build using production flag (Doens't exist before build)
    - angular-truffle-dapp/: includes an html index, a styles page and some js files compiled for the ts

- /e2e: Folder created by angular to contain e2e definitions, end2end automatic testing

- /installers: Contains the files required to create windows installer
    - windows/createinstaller.js: js file used to create a windows installer once the app is packaged for windows
    - setupEvents.js: Define squirrel events for windows in case of install, uninstall, obsolete or update

- /migrations: Contains the files required to deploy smart contracts using truffle migrate
    - 1_initial_migration.js: Deploys the Migration smart contract to the blockchain
    - 2_deploy_contracts.js: Deploys the CryptoHandler library, links it with the Factory and deploys the Factory

- /node_modules: Contains node modules (Doesn't exist before npm install)
    - Should be modified as told at the begining of this file to solve inconsistencies between Angular 6 and Truffle

- /release-build: Contains executables of the app packages for Windows, Linux and MacOS & an installer for Windows (Doesn't exist before package targeting any distro)
    - Seths Network-darwin-x64: Packaged app for MacOS x64
    - seths-network-linux-x64: Packaged app for Debian x64
    - seths-network-win32-ia32: Packaged app for Windows x32
    - windows-installer: Installer for the packaged app for Windows
    - mac-installer: Installer for the packaged app for MacOS
    - debian-installer: Installer for the packaged app for Debian

- /src: Contains the source and configuration files of the application
    - typings.d.ts: Required to create the typings of the js libraries that doesn't include them by default
    - index.html: Entry point of the application, needs to be modified if the app is served using ng-serve instead of built
    - The rest of .json, .ts and other files under this folder remain untouched
    - /util: Contains ts classes necessary for other components of the app
        - account.ts: Ts class of an account including address, balance and last block scrutinized (channels remains unused in this version of the app)
        - channel.ts: Ts class of a channel including functions to generate hashes and check that R hashes in H
        - error.ts: Ts class to notificate errors and warnings
        - filter.pipi.ts: Ts pipe to filter an array by address used in search bars (for accounts and channels)
        - notification.ts: Ts class to notificate new events and successful blockchain calls
        - updateParams.ts: Ts class of the parameters necessary to update or dispute a channel, including the signature generation
        - validation.ts: Ts class defining validation functions for app forms
    - /environment & /assets: Not modified
    - /app: Contains all the classes the app needs to operate. Each component has a html, css and ts file according to Angular data structure. Each ts file has his .spec.ts file for test purposes using Jasmine through Karma when ng test is executed, because tests are not defined this files are superfluous
        - web3.service.ts: Ts service to provide the whole app of a common and unique way to retrieve and send information asynchronouly to the Blockchain using web3. This service also interacts with NeDB service.
        - notifications.service.ts: Ts service to provide the whole app of a common and unique way to send and read notifications emitted by other services or component during the execution of the application.
        - nedb.service.ts: Ts service to provide the whole app of a common and unique way to store and retrieve data from the NeDB indexedDB.
        - app.module.ts: Root module of the app including declarations of components and pipes, imports of modules used by the app, providers if any and bootstraps in this case the app component.
        - app.component.ts: Root component of the application. In charge of initialize the events provided by web3 service.
        - app-routing.module.ts: Ts module that defines the routing of the application throug router-outlets to define which components should be displayed according to different paths. Specifies which routes are available, how should be contructed, which paramets can be added and which components are link to which paths. 
        - /operation: Component used to interact with a certain channel in different ways, based in forms
            - .ts: Defines the operation of some validators and the submits of form to interact with the blockchain and NeDB through the web3service
            - .html: Defines two hidden forms to create or update/dispute a channel, depending on the operation passed to its component in the URL
        - /notifications: Component used to display notifications and errors/warnings and interact with them
            - .ts: Defines how the interaction with errors and notifications is done
            - .html: Defines two possibly hidden lists or notifications and errors and allow the interaction with them
        - /main: Component used to display all accounts available with its address and balance and navigate to them
            - .ts: Defines how to nagivate to each of the accounts displayed
            - .html: Defines the list of accounts using a filter through a searchBar
        - /lightning: To be developed as part of the off-chain interaction of the network
        - /configuration: Component used to change configuration settings (On development)
            - .ts: Defines how to interact with configuration parameters
            - .html: Defines the different configuration possibilities
        - /channels: Component used to display all the channels of an account and create a new one
            - .ts: Defines how to navigate to each of the channels and how to navigate to operations to create a channel
            - .html: Defines the list of channels using a filter
        - /channels-details: Compondnt used to display a channel details and allow the interaction with it
            - .ts: Defines how the navigation and interaction with the contract is done according to validators and the live cycle of the channel
            - .html: Defines the channels information, the navigation to channel's operations and some channel simple operations
        - /account: Component used as route parent of channels, channels-dateials and operations associated with an account
            - .ts: Subscribe to its account of accounts observable
            - .html: Displays the account info

Also:
- Readme & License
- Configuration files for truffle, debian-installer, angular, typescript, electron and node

## Usage

###Walkthrough of the app

The operation of the app will appear extrange according to the Lightning Network definition, but it is just for development purposes because we are generating channels only between accounts we own. Signature and updates will be forged instead of receiving them from a Lightning user for this motive.

Once the app is lauched you will see the main page showing the title of the app, the configuration button and notifications on top of the screen. Notifications should appear by default with a number 1 or a number 2 deppending if the DB is empty or not (if the app has been started for first time or the db has been droped). Also, a list with all accounts accesible in your node (if you are using Ganache a list of 10 account) must appear, if not probably your node is not working properly or has not been launched.

![Main page](figures/mainpage.jpg?raw=true)

At this point you can click on the account (e.g. 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544) you prefer to start interacting with. The screen will change displaying the balance and address of the selected account on top, and a button to create a channel will appear just above to another button to navigate back to the main page.

![Empty account](figures/account_empty.jpg?raw=true)

If you click on Create Channel the view of the app will change, a form to create a channel will appear with three inputs and a submit button. To create a channel just introduce the amount locked in the channel (e.g. 1) in Ethers using dot notation for floats, the destinatary (e.g. 0xf17f52151EbEF6C7334FAD080c5704D77216b732) in Ethereum address format, and the time the channel will remain open (e.g. 20) in days being the number an integer. Finally submit clicking on Create Channel. A message indicating the status of the transaction will appear on top of the form. Once the notification is succesfully mined by the blockchain, the app will navigate back to the page where our account info appear. Now a new table will be displayed including the new created channel with a search bar to filter the channels. Also 3 new notification will be fired, two are the events generated by the factory when a new channel is created and the other is the notification generated when a succesful transaction has been executed in the blockchain. 

![Create channel empty](figures/createchannel.jpg?raw=true)

![Create channel](figures/createchannel_1.jpg?raw=true)

![Account with the new channel](figures/account.jpg?raw=true)

If you click on the notification button a new paged will be displayed showing all erros and notifications (if any). You can select notifications/errors one by one click on them, or select them all using the Select all button. To delete them use the Delete selected or Delete all buttons. Each of the notification can be navigated to the channel or account that has generated them by clicking on the check button.

![Not selected notifications](figures/notif_not_selected.jpg?raw=true)

![All selected notifications](figures/notif_selected.jpg?raw=true)

![Empty notifications](figures/notif_empty.jpg?raw=true)

Going back to our account page where the new channel appears, we can click on the channel to display its details. A button to navigate back will appear, and no more buttons for the moment.

![Channel details](figures/channel_details.jpg?raw=true)

If we navigate back to the main page using Go Root button we can select the destinatary of the channel (e.g. 0xf17f52151EbEF6C7334FAD080c5704D77216b732) where the new channel will appear as well. If we click on it we will see the same information than in the previous figure but a new form will appear at the bottom. This form allow us to accept the channel and lock some funds (e.g. 0.5), this form only appears because we are the far end and the channel is not yet accepted, otherwise the form will be hidden. If we click on accept another status message will appear. When the transaction is succesfuly mined and executed the form will disappear and the accepted parameter of the channel will change to accepted. Also, three new notifications will be fired by analogy to the Create Channel form explained before.

![Accept with validator](figures/accept_with_validator.jpg?raw=true)

![Accept](figures/accept.jpg?raw=true)

![Channel details accepted](figures/channel_details_accepted.jpg?raw=true)

At this point we will see on the channel details in any of the two mentioned accounts two new buttons to update the state or close the channel. If we click on update state a new screen will be displayed with a form to update the state. To update the state we need to include the sender of the state (e.g. 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544 if we clicked on the Update State of the channel details of the channel list of the 0xf17f52151EbEF6C7334FAD080c5704D77216b732 account) that must be the other end of the channel, the far end if we have navigated using the account presented as near end (the one that has created the channel) and the near end otherwise. The total amount send by the sender after a simulated bunch of off-chain transactions (e.g. 0.2) that should be smaller than the funds locker by this account in the channel. The id (e.g. 11) that should be bigger than the last id uploaded to the channel (initally 0). 

The rest of the parameters are optional because make reference to any number of conditional transaction, let's go make up one conditional just to test its correct behavior. We will add a 32 bytes random (e.g. 0x40e7b8b686ee4dde3517132186a65df96d380ee4f0c88d40c98fec56c706a149 the keccak256 hash of "Some input"), then a ttl in unix time smaller than the close of the channel (e.g. 1530964800 equivalent to 07/07/2018 @ 12:00pm (UTC) ). Then the value send by the conditional transaction (e.g. 0.1) in Ethers. Finally the direction, using 1 for outgoing transactions (from us to the other end) and 0 for ongoing (from the other end to us) (e.g. 1). The signature input should be left black by default, is possible include it if you compute the signature of the message as described in src/utils/updateParams.ts generateSignature() function using the keccack256 hashing used by solidity and the signature using the uploader Ethereum account with the ECDSA signature algorithm used by Ethereum. 

If is left black the app will automatically generate the signature for you, I don't recommend generate your own signature if you don't strictly follow the steps described in updateParams.ts using exactly the same libraries.

![Update channel 1](figures/update_state_1.jpg?raw=true)
![Update channel 2](figures/update_state_2.jpg?raw=true)

If we click on Update channel an status message indicating the status of the Blockchain transaction will appear. If the transaction is mined and executed correctly the app will automatically navigate back to our account screen. Also 5 new notifications will appear, the first indicated that the transaction has been executed succesfully, two of them come from the event thrown during the update of the channel for each account and the two left are fired for the event thrown during the unlocking of the conditional transaction. 

If we click in the channel we will see the updated parameters, first 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544 has send 0.2 Eth to 0xf17f52151EbEF6C7334FAD080c5704D77216b732, the state should show 0.8 for the first and 0.7 for the second. Because a conditional transaction has been executed correctly being it outgoing 0xf17f52151EbEF6C7334FAD080c5704D77216b732 has send 0.1 Eth to 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544, the state shows 0.6 for the first and 0.9 for the second, in other words is like sending the 0.1 Eth from the first to the second knowing that the first has 0.7 and the second 0.8 before the transaction. Finally, an info alert must appear showing the random shown and the hash of this random. We can upload as many updates as we want during the time the channel remains open, if we introduce any correct input the form validator will notify us diabling the button and showing a message, otherwise if the transaction is incorrect a message saying that the state of the EthereumVirtualMachine has been reverted in the execution of the transaction due to an exception. 

![Channel updated 1](figures/state_updated_with_hlt.jpg?raw=true)
![Channel updated 2](figures/state_updated_with_hlt_2.jpg?raw=true)

Now we can try to close the channel to unlock the funds. First we need to request a close of the channel from any of the two account (e.g. 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544) using close the channel button. The status of the transaction will appear and once mined and succesfully executed three new notifications will be fired saying that the transaction was succesfully executed and a new request to close the channel has been uploaded to the channel by the account 0x821... If we now navigate to the other account (e.g. 0xf17f52151EbEF6C7334FAD080c5704D77216b732) from the root or using the notification check button, we can request close the channel in the same way. Because this time the channel see a close request of both owners the channel will close and the funds will be distributed among the owners according to the last state uploaded.

![Channel closed and balance updated](figures/balance_closed.jpg?raw=true)

Once the channel is closed any button to interact with the channel will be displayed independently of the live cycle of the channel.

![Channel closed](figures/closed.jpg?raw=true)

Unlock funds and Dispute state button on channel details are hidden due to the live cycle of smart contracts, when the channel expires after the days specified during the creation of the channel a Dispute state button will appear instead of the Update state button. Dispute state form is exactly equal than Update state with the only difference that the contract will only allow us to upload one Dispute, if we try to upload another the status will display an error because EVM state is reverted. Unlock funds will be shown when the settlement time expires, this is one day after the channel expires, distributing the funds in the channel according to the last state updated.
 
//Video

## Third-party modules

Apart from Angular, Electron and its dependencies:

"async-mutex": "^0.1.3" - Mutex

"bootstrap": "^4.1.1" - Styles

"nedb": "^1.8.0" - DB

"web3": "^1.0.0-beta.34" - Blockchain interaction

"electron-installer-dmg": "^1.0.0" - Installer MacOS

"electron-winstaller": "^2.6.4" - Installer Windows

"truffle-contract": "^3.0.5" - Blockchain interaction

"@types/node": "^8.9.5" - Typings
