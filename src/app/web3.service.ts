import { Injectable, OnInit } from '@angular/core';
import { channel } from '../util/channel';
import { account } from '../util/account';
import { BehaviorSubject, Observable } from 'rxjs';
import { updateParams } from '../util/updateParams';
import { error } from '../util/error';
import { NedbService } from './nedb.service';
import { NotificationsService } from './notifications.service';
import { notification } from '../util/notification';

const Web3 = require('web3');
const contract = require('truffle-contract');

//Contract JSON artifacts
const factoryArtifacts = require('../../build/contracts/Factory.json');
const channelArtifacts = require('../../build/contracts/ChannelFinal.json');

//Where the service is injected
@Injectable({
  providedIn: 'root'
})
export class Web3Service implements OnInit {

  web3: any;

  Factory = contract(factoryArtifacts);
  Channel = contract(channelArtifacts);

  accounts: account[] = [];
  channels: Map<string, channel[]> = new Map();

  // Behavior subjects and its observables
  private accountsSource = new BehaviorSubject<account[]>(this.accounts);
  private channelsSource = new BehaviorSubject<Map<string, channel[]>>(this.channels);
  accounts$ = this.accountsSource.asObservable();
  channels$ = this.channelsSource.asObservable();
  
  constructor(private neDBService: NedbService, private notificationsService: NotificationsService) {
    this.instantiateWeb3();
    this.retrieveAccountsFromDB();
    this.retrieveAccountsFromEth();
    this.setProviders();
  }

  ngOnInit(){}

  //Instanciate web3 provider to work with our local node
  instantiateWeb3() {
    try{
      if (typeof this.web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        let err = new error('Web3Service', 'Web3 injected by the browser', 'warning');
        this.notificationsService.addErrorSource(err);
        this.web3 = new Web3(this.web3.currentProvider);
      } else {
        // Fallback to localhost:7545
        let err = new error('Web3Service', 'Web3 not injected, falling back to localhost:7545', 'warning');
        this.notificationsService.addErrorSource(err);
        this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
      }
    } catch(e) {
      alert(e);
    }
  }

  //Retrieve accounts stored in NeDB, asynchronously as a promise
  retrieveAccountsFromDB() {

    this.neDBService.getAccounts().then(val => {
      this.accounts = val;
      //Initialize the mapping and refresh balance
      for(let acc of this.accounts) {
        this.channels.set(acc.address, []);
        this.updateBalance(acc);
      }
    }).catch(e => {
      let err = new error('NeDBService', 'Error retrieving accounts from DB' + e, 'danger');
      this.notificationsService.addErrorSource(err);
    });

  }

  //Retrieve accounts and its balance from our node using web3, asynchronously as promises
  retrieveAccountsFromEth() {

    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        let e = new error('Web3Service', 'Error retrieving accounts from node' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      } else if (accs.length === 0) {
        let e = new error('Web3Service', 'Zero accounts retrieved from node, check node configuration' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      for (let acc of accs) {
        //Get balance, asynchronously as promise
        this.web3.eth.getBalance(acc, (err, val) => {
          if (err != null) {
            let e = new error('Web3Service', 'Error retrieving accounts balance' + err, 'danger');
            this.notificationsService.addErrorSource(e);
            return;
          }

          let found = false;

          for (let v of this.accounts)
            if (v.address == acc)
              found = true;

          //Check if the account is not in DB yet and notify other components and services
          if (!found) {
            let tmp = new account(acc, this.web3.utils.fromWei(val.toString()));
            this.channels.set(acc, []);
            this.updateAccountSource(tmp);
          }

        });
      }

    });
  }

  //Set web3 providers for truffle-contract library and fix the difference between web3 v1.0.0 and web3 v.0.20.23
  setProviders() {

    // Fix difference for httpProvider between web3 v1.0.0 and web3 v0.20.23, the last used by truffle-contract
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send

    // Bootstrap the abstractions for Use.
    this.Factory.setProvider(this.web3.currentProvider);
    this.Channel.setProvider(this.web3.currentProvider);

  }

  //Process a new channel event fired by the Factory smart contract that include self address as far end of the channel
  channelProcessedEventFar(self) {
    //Check if factory is deployed and chain promises
    this.Factory.deployed()
      .then((instance) => {
        
        //Define the filter
        let ev = instance.channelProcessed({ FarEnd: self.address }, { fromBlock: self.lastBlockScr});
        
        //Watch from 'fromBlock' matching 'FarEnd' restriction, as promise
        ev.watch((err, res) => {
          if (err != null) {
            let e = new error('Web3Service', 'Error processing new channel event' + err, 'danger');
            this.notificationsService.addErrorSource(e);
            return;
          }

          //Notify all about the new event catch, including the address route to the account associated with the channel
          let objects = 'accounts/'+JSON.stringify(self);
          let n = new notification('Web3Service', 'New channels event catch '+ res.args.ContractAddrs + ' at '+ self.address, 'info', objects);
          this.notificationsService.addNotificationsSource(n);
          
          //New channel using event params
          let tmp = new channel(
            res.args.ContractAddrs,
            res.args.NearEnd,
            res.args.FarEnd,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            res.args.endDate,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            0
          )

          //Update last block scrutinized, update account balance just in case and update the source
          this.sleep(300).then(() => this.updateLastBlock(res.blockNumber));
          this.updateBalance(self);
          this.updateChannelsSource(self.address, tmp);

        });

      });
  }

  // Delete when migrating to production. Just for development purposes, not really necessary.
  //Same as the previous function modifying the filter to catch events that include self address as near end of the channel
  channelProcessedEventNear(self) {
    this.Factory.deployed()
      .then((instance) => {

        let ev2 = instance.channelProcessed({ NearEnd: self.address }, { fromBlock: self.lastBlockScr });

        ev2.watch((err, res) => {
          if (err != null) {
            let e = new error('Web3Service', 'Error processing new channel event' + err, 'danger');
            this.notificationsService.addErrorSource(e);
            return;
          }

          let objects = 'accounts/' + JSON.stringify(self);
          let n = new notification('Web3Service', 'New channels event catch ' + res.args.ContractAddrs + ' at ' + self.address, 'info', objects);
          this.notificationsService.addNotificationsSource(n);
          
          let tmp = new channel(
            res.args.ContractAddrs,
            res.args.NearEnd,
            res.args.FarEnd,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            res.args.endDate,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            0
          )

          this.sleep(300).then(() => this.updateLastBlock(res.blockNumber));
          this.updateBalance(self);
          this.updateChannelsSource(self.address, tmp);

        });

      });
  }

  //Asyc function to create a new channel using the factory. The function is returned as a promise
  async createNewChannel(self, receiver, amount, days): Promise<any> {
    
    //Check if factory is deployed, synchronously
    let instance = await this.Factory.deployed();

    //Return the promise of createChannel RPC
    return instance.createChannel(receiver, days, {
      from: self,
      gas: 3000000,
      value: this.web3.utils.toWei(amount, 'ether')
    });
      
  }

  //Process a channel accepted emitted for the channel channel associated with the account self
  channelAcceptedEvent(self, channel: channel): any {

    // Define channel contract instance and define the filter
    let instance = this.Channel.at(channel.address);
    let evt = instance.channelAccepted({}, { fromBlock: channel.lastBlockScr });
    
    //Watch for event according to the filter, asynchronously as promise
    evt.watch((error, result) => {
      if (error != null) {
        let e = new error('Web3Service', 'Error processing accept channel event' + error, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //Notify all about the new event catch
      
      let objects = 'accounts/' + JSON.stringify(this.getAccountFromAddress(self)) + '/channels/' + JSON.stringify(channel);
      let n = new notification('Web3Service', 'New accept event catch '+ channel.address, 'info', objects);
      this.notificationsService.addNotificationsSource(n);
      
      //Update channel, update observable and update last block scrutinized
      channel.value = this.web3.utils.fromWei(result.args.totalValue.toString());
      channel.accepted = true;
      channel.farEndValue = this.web3.utils.fromWei(result.args.farEndValue.toString());
      this.sleep(300).then(() => this.updateLastBlock(result.blockNumber));
      this.updateChannelsSource(self, channel, true);
      
    });

    //Return the filter to end watching if necessary
    return evt;
      
  }

  //Async function to accept a channel channel from an account self. Function is returned as a promise
  async acceptChannel(contract, self, value): Promise<any> {

    //Await to instanciate contract channel, synchronously
    let instance = await this.Channel.at(contract);

    //Return promise of acceptChannel RPC
    return instance.acceptChannel({
      from: self,
      gas: 300000,
      value: this.web3.utils.toWei(value, 'ether')
    });
  }

  //Async function to update the state of a channel channel from an account self according to update parameters. 
  //Function is returned as a promise
  async updateState(contract, self, updateParameters: updateParams): Promise<any> {
    
    let instance = await this.Channel.at(contract);

    //Return promise of updateState RPC
    return instance.updateState(
      updateParameters.end_chann, updateParameters.values_id,
      updateParameters.v, updateParameters.r_s,
      updateParameters.rsSigned, updateParameters.rs, updateParameters.hs,
      updateParameters.ttls, updateParameters.rhVals, updateParameters.ends,
      {
        from: self,
        gas: 3000000
      }
    );
  }

  //Process the state updated event fired from a channel channel linked to account self
  updateStateEvent(self, channel: channel): any {
    let instance = this.Channel.at(channel.address);
    
    //Define the filter
    let ev  = instance.stateUpdated({}, {fromBlock: channel.lastBlockScr });
    
    //Watch for event according to the filter
    ev.watch((err, res) => {
      if(err != null) {
        let e = new error('Web3Service', 'Error processing update state event' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //Notify all and update channel and account, like the rest of events
      let objects = 'accounts/' + JSON.stringify(this.getAccountFromAddress(self)) + '/channels/' + JSON.stringify(channel);
      let n = new notification('Web3Service', 'Update state event catch ' + channel.address, 'info', objects);
      this.notificationsService.addNotificationsSource(n);

      channel.id = res.args.currentId.toString();

      if(res.args.sender.toLowerCase() == channel.nearEnd.toLowerCase()) {
        channel.nearEndValue = this.web3.utils.fromWei(res.args.senderValue.toString());
        channel.farEndValue = this.web3.utils.fromWei(res.args.uploaderValue.toString());
      } else if(res.args.sender.toLowerCase() == channel.farEnd.toLowerCase()) {
        channel.nearEndValue = this.web3.utils.fromWei(res.args.uploaderValue.toString());
        channel.farEndValue = this.web3.utils.fromWei(res.args.senderValue.toString());
      }
      
      this.sleep(300).then(() => this.updateLastBlock(res.blockNumber));
      this.updateChannelsSource(self, channel, true);
    });

    return ev;

  }

  //Process the random shown event fired by a channel channel linked to the account self
  randomShownEvent(self, channel: channel) {
    let instance = this.Channel.at(channel.address);
    
    //Define the filter
    let ev = instance.rsShownAndUsed({} ,{fromBlock: channel.lastBlockScr } )
    
    //Watch for events according to the filter
    ev.watch((err, res) => {
      if (err != null) {
        let e = new error('Web3Service', 'Error processing radom showed event' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //Notify all and update channel and account, like the rest of events
      let objects = 'accounts/' + JSON.stringify(this.getAccountFromAddress(self)) + '/channels/' + JSON.stringify(channel);
      let n = new notification('Web3Service', 'Random showed event catch ' + channel.address, 'info', objects);
      this.notificationsService.addNotificationsSource(n);
      channel.getRsShowed(res.args.random);
      
      this.sleep(300).then(() => this.updateLastBlock(res.blockNumber));
      this.updateChannelsSource(self, channel, true);
    });

    return ev;
  }

  //Async function to dispute the state of a channel channel from an account self according to dispute parameters. 
  //Function is returned as a promise
  async disputeState(contract, self, disputeParameters): Promise<any> {
    let instance = await this.Channel.at(contract);

    //Return the promise of disputeState RPC
    return instance.disputeState(
      disputeParameters.end_chann, disputeParameters.values_id,
      disputeParameters.v, disputeParameters.r_s,
      disputeParameters.rsSigned, disputeParameters.rs, disputeParameters.hs,
      disputeParameters.ttls, disputeParameters.rhVals, disputeParameters.ends,
      {
        from: self,
        gas: 3000000
      }
    );
  }

  //Process the state disputed event fired from a channel channel linked to account self
  disputeStateEvent(self, channel: channel) {

    let instance = this.Channel.at(channel.address);

    //Define the filter
    let ev = instance.disputeAccepted({}, {fromBlock: channel.lastBlockScr })
    
    //Start watching events according to the filter
    ev.watch((error, result) => {
      if (error != null) {
        let e = new error('Web3Service', 'Error processing dispute state event' + error, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }
      
      //Notify all and update channel and account, like the rest of events
      let objects = 'accounts/' + JSON.stringify(this.getAccountFromAddress(self)) + '/channels/' + JSON.stringify(channel);
      let n = new notification('Web3Service', 'Dispute state event catch ' + channel.address, 'info', objects);
      this.notificationsService.addNotificationsSource(n);

      channel.id = result.args.currentId.toString();

      this.sleep(300).then(() => this.updateLastBlock(result.blockNumber));
      this.updateChannelsSource(self, channel, true);

    });

    return ev;

  }

  //Async function to close a channel. Functions is returned as a promise
  async closeChannel(contract, self, bool): Promise<any> {
    let instance = await this.Channel.at(contract);

    //Return the promise closeChannel RPC
    return instance.closeChannel(
      bool,
      {
        from: self,
        gas: 300000
      }
    );
  }

  //Process a close request event fired from a channel channel linked to account self
  channelCloseRequestEvent(self, channel: channel) {
    let instance = this.Channel.at(channel.address);
    
    //Define the filter
    let ev = instance.closeRequest({}, {fromBlock: channel.lastBlockScr })
    
    //Start watching events according to the filter
    ev.watch((err, res) => {
      if (err != null) {
        let e = new error('Web3Service', 'Error processing close request channel event' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //Notify all and update channel and account, like the rest of events
      this.sleep(300).then(() => this.updateLastBlock(res.blockNumber));
      let objects = 'accounts/' + JSON.stringify(this.getAccountFromAddress(self)) + '/channels/' + JSON.stringify(channel);
      let n = new notification('Web3Service', "Close request from " + res.args.end + " catch at " + self, 'info', objects);
      this.notificationsService.addNotificationsSource(n);

      /*
        In case request close feature is added
        this.updateChannelsSource(self, channel, true);
      */
    });

    return ev;

  }

  //Async function to unlock funds of a channel. Functions is returned as a promise
  async unlockFunds(contract, self): Promise<any> {
    let instance = await this.Channel.at(contract);

    //Return the promise of unlockFunds RPC
    return instance.unlockFunds(
      {
        from: self,
        gas: 300000
      }
    );
  }

  //Process the close event of a channel channel linked to the account self
  channelCloseEvent(self, channel: channel) {
    let instance = this.Channel.at(channel.address);

    //Define the filter
    let ev = instance.channelClosed({}, {fromBlock: channel.lastBlockScr })
    
    //Start watching for events according to the filter
    ev.watch((err, res) => {
      if (err != null) {
        let e = new error('Web3Service', 'Error processing close channel event' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //Notify all and update channel and account, like the rest of events
      channel.setClosed();
      channel.nearEndValue = this.web3.utils.fromWei(res.args.nearEndFinalValue.toString());
      channel.farEndValue = this.web3.utils.fromWei(res.args.farEndFinalValue.toString());
      channel.id = res.args.finalId.toString();

      let objects = 'accounts/' + JSON.stringify(this.getAccountFromAddress(self)) + '/channels/' + JSON.stringify(channel);
      let n = new notification('Web3Service', "Close event catch " + channel.address, 'info', objects);
      this.notificationsService.addNotificationsSource(n);


      this.sleep(300).then(() => this.updateLastBlock(res.blockNumber));
      this.updateChannelsSource(self, channel, true);
    });

    return ev;

  }

  //Update the behavior subject accounts source and notify the observers through the observable using next
  updateAccountSource(account: account, modify = false) {
    //Check if the source needs to modify an existing account or add a new one
    if (modify) {
      //Double check if account exists
      this.accounts.forEach((item, index) => {
        //Update account in db, object and fire an update to the observable
        if (item.address == account.address) {
          this.accounts[index] = account;
          this.neDBService.updateAccount(account);
          this.accountsSource.next(this.accounts);
        }
      });
    } else {
      //Push a new account, insert it in db and fire an update to the observable
      this.accounts.push(account);
      this.neDBService.insertAccount(account);
      this.accountsSource.next(this.accounts);
    }

  }

  //Update the behavior subject channels source and notify the observers through the observable using next
  updateChannelsSource(account: any, channel: channel, modify = false, inDb = false) {

    //Check if channel already exists and we want to modify it or we need to add a new one
    if (modify) {
      //Double check if channel exists
      this.channels.get(account).forEach((item, index) => {
        if (item.address == channel.address) {
          //Update object and db
          this.channels.get(account)[index] = channel;
          this.neDBService.updateChannel(account, channel);
        }
      });

    } else if(inDb) {
      //Insert in db
      this.channels.get(account).push(channel);

    } else if (!this.channels.get(account).includes(channel)) {
      let found = false;

      //Double check that the channel doesn't exist
      this.channels.get(account).forEach((item, index) => {
        if (item.address == channel.address)
          found = true;
      });

      //Push object and insert it to the db
      if (!found) {
        this.channels.get(account).push(channel);
        this.neDBService.insertChannel(account, channel);
      }
    }

    //Fire an update event to the observable
    this.channelsSource.next(this.channels);
  }

  //Update account balance asynchronously, using a promise
  updateBalance(account: account) {
    //Update Balance of an account
    this.web3.eth.getBalance(account.address, (err, val) => {
      if (err != null) {
        let e = new error('Web3Service', 'Error processing update balance' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //Update source
      account.balance = this.web3.utils.fromWei(val.toString());
      this.updateAccountSource(account, true);
    });
  }

  //Utils

  //Update in db and in each channel the last block scrutinized to avoid catching events multiple time or going to deeper in 
  //the chain to catch past catched events
  updateLastBlock(lastBlockScrutinized) {
    //Update all channels and accounts last block scrutinized

    for(let acc of this.accounts) {
      acc.lastBlockScr = lastBlockScrutinized;
      this.neDBService.updateAccount(acc);
      this.updateBalance(acc);

      let channs = this.channels.get(acc.address);

      for(let chann of channs) {
        chann.lastBlockScr = lastBlockScrutinized;
        this.neDBService.updateChannel(acc.address, chann);
      }
    }
  }

  //Get the account which address is address
  getAccountFromAddress(address): account {
    for(let acc of this.accounts)
      if(acc.address == address)
        return acc

    return null;
  }

  //Define sleep as a promise due to node event loop asynchronous operation
  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

}