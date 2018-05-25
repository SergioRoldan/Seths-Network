import { Injectable, OnInit } from '@angular/core';
import { channel } from '../util/channel';
import { account } from '../util/account';
import { BehaviorSubject } from 'rxjs';

const Web3 = require('web3');
const Web3Utils = require('web3-utils');
const contract = require('truffle-contract');

const factoryArtifacts = require('../../build/contracts/Factory.json');
const channelArtifacts = require('../../build/contracts/ChannelFinal.json');

@Injectable({
  providedIn: 'root'
})
export class Web3Service implements OnInit {

  web3: any;

  Factory = contract(factoryArtifacts);
  Channel = contract(channelArtifacts);

  accounts: account[] = [];
  channels: Map<string, channel[]> = new Map();

  contractEvent: any;

  private accountsSource = new BehaviorSubject<account[]>(this.accounts);
  private channelsSource = new BehaviorSubject<Map<string, channel[]>>(this.channels);

  accs = this.accountsSource.asObservable();
  channs = this.channelsSource.asObservable();
  
  constructor() {
    this.checkAndInstantiateWeb3();
  }

  ngOnInit(){}

  checkAndInstantiateWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof this.web3 !== 'undefined') {
      console.warn('Using web3 detected from external source. If you find that your accounts don\'t appear or you have ' +
        '0 Ether, ensure you\'ve configured that source properly.');
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(this.web3.currentProvider);
    } else {
      console.warn('No web3 detected. Falling back to http://localhost:7545.');
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    }

    this.retrieveAccounts();
    this.setProviders();
  }

  updateAccountSource(account: account, modify=false) {
    if(modify) {
      this.accounts.forEach((item, index) => {
        if(item == account) {
          this.accounts[index] = account;
          this.accountsSource.next(this.accounts);
        }
      });
    } else {
      this.accounts.push(account);
      this.accountsSource.next(this.accounts);
    }
  
  }

  updateChannelsSource(account: any, channel: channel, modify = false) {
    //console.log(channel)

    if (modify) {

      this.channels.get(account).forEach((item, index) => {
        if(item.address == channel.address)
          this.channels.get(account)[index] = channel;
      });

    } else if (!this.channels.get(account).includes(channel)) {
      let found = false;

      this.channels.get(account).forEach((item, index) => {
        if (item.address == channel.address)
          found = true;
      });

      if(!found)
        this.channels.get(account).push(channel);
    }
    

    this.channelsSource.next(this.channels);
  }

  updateBalance(account: account) {
    this.web3.eth.getBalance(account.address, (err, val) => {
      if (err != null) {
        alert('There was an error fetching balance of account ' + account.address + ': ' + err);
        return;
      }
      account.balance = val;
      this.updateAccountSource(account, true);
    });
  }

  retrieveAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        alert('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      for (let acc of accs) {
        this.web3.eth.getBalance(acc, (err, val) => {
          if (err != null) {
            alert('There was an error fetching balance of account ' + acc + ': ' + err);
            return;
          }
          let tmp = new account(acc, this.web3.utils.fromWei(val));
          this.channels.set(acc, [])
          this.updateAccountSource(tmp);
        });
      }

    });
  }

  setProviders() {

    // Fix difference for httpProvider bettween web3 v1 and web3 v0.20 used by truffle-contract
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send

    // Bootstrap the abstractions for Use.
    this.Factory.setProvider(this.web3.currentProvider);
    this.Channel.setProvider(this.web3.currentProvider);

  }

  newProviders() {
    this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

    // Bootstrap the abstractions for Use.
    this.Factory.setProvider(this.web3.currentProvider);
    this.Channel.setProvider(this.web3.currentProvider);
  }

  channelProcessedEvent(self, from, to) {
    this.Factory.deployed()
      .then((instance) => {

        this.contractEvent = instance.channelProcessed({ FarEnd: self }, { fromBlock: 0})
        
        this.contractEvent.watch((err, res) => {
          if (err != null) {
            alert('There was an error getting event for account X');
            return;
          }

          //for(let chan of res) {
            let tmp = new channel(
              res.args.ContractAddrs,
              res.args.NearEnd,
              res.args.FarEnd,
              this.web3.utils.fromWei(res.args.channelVal.toString()),
              res.args.endDate,
              this.web3.utils.fromWei(res.args.channelVal.toString()),
              0
            )


            this.updateChannelsSource(self, tmp);
            //let evt = this.channelAcceptedEvent(self, tmp, 0, to);
        
          //}

          /*this.updateStateEvent(tmp, res.blockNumber, to);
          this.disputeStateEvent(tmp, res.blockNumber, to);
          this.randomShowedEvent(tmp, res.blockNumber, to);
          this.channelCloseRequestEvent(tmp, res.blockNumber, to);
          this.channelCloseEvent(tmp, res.blockNumber, to);*/
          
        });

      });
  }

  async createNewChannel(self, receiver, amount, days): Promise<any> {
    
    let instance = await this.Factory.deployed();

    return instance.createChannel(receiver, days, {
      from: self,
      gas: 3000000,
      value: this.web3.utils.toWei(amount, 'ether')
    });
      
  }

  channelAcceptedEvent(self, channel, from, to): any {

    let instance = this.Channel.at(channel.address);
    console.log("Fuck it ! ", from, ' ! ', to, ' ! ', channel, ' ! ', self);

    let evt = instance.channelAccepted({}, { fromBlock: 0 })
    
    evt.watch((error, result) => {
      if (error != null) {
        alert('There was an error getting event accepted from channel ' + channel);
        return;
      }

      console.log("-> Not limiter watch", result);

      //console.log("Result watch: ", result, from, to, channel.address);
      
      channel.value = this.web3.utils.fromWei(result.args.totalValue.toString());
      channel.accepted = true;
      channel.farEndValue = this.web3.utils.fromWei(result.args.farEndValue.toString());

      console.log("Channel accepted");

      this.updateChannelsSource(self, channel, true);
      
      //ev.stopWatching();
    });

    return evt;
      
  }

  async acceptChannel(contract, self, value): Promise<any> {
    let instance = await this.Channel.at(contract);

    return instance.acceptChannel({
      from: self,
      gas: 300000,
      value: this.web3.utils.toWei(value, 'ether')
    });
  }

  async updateState(contract, self, updateParameters): Promise<any> {
    let instance = await this.Channel.at(contract);

    return instance.updateState(
      updateParameters.end_chann, updateParameters.values_id,
      updateParameters.v, updateParameters.r_s,
      updateParameters.rsSigned, updateParameters.rs, updateParameters.hs,
      updateParameters.ttls, updateParameters.rhVals, updateParameters.end,
      {
        from: self,
        gas: 3000000
      }
    );
  }

  updateStateEvent(channel: channel, from, to) {
    let instance = this.Channel.at(channel.address);

    instance.stateUpdated( {fromBlock:0}).watch((err, res) => {
      if(err != null) {
        alert('There was an error getting event update state from channel ' + channel.address);
        return;
      }

      channel.id = res.args.currentId;
      channel.nearEndValue = res.args.nearEndValue;
      channel.farEndValue = res.args.farEndValue;

      console.log("Channel state updated");
    });

  }

  randomShowedEvent(channel: channel, from, to) {
    let instance = this.Channel.at(channel.address);

    instance.rsShownAndUsed( {fromBlock:0} ).watch((err, res) => {
      if (err != null) {
        alert('There was an error getting event random showed from channel ' + channel.address);
        return;
      }

      for(let ran in res.args.random) {
        if(channel.checkRandomHashesInH(ran)) {
          channel.addRandomLock(ran)
          console.log("Random showed");
        }
          
      }
      for(let ran in res.args.randomS) {
        if (channel.checkRandomHashesInH(ran)) {
          channel.addRandomLock(ran)
          console.log("Random showed");
        }
      }
    });
  }

  async disputeState(contract, self, disputeParameters): Promise<any> {
    let instance = await this.Channel.at(contract);

    return instance.disputeState(
      disputeParameters.end_chann, disputeParameters.values_id,
      disputeParameters.v, disputeParameters.r_s,
      disputeParameters.rsSigned, disputeParameters.rs, disputeParameters.hs,
      disputeParameters.ttls, disputeParameters.rhVals, disputeParameters.end,
      {
        from: self,
        gas: 3000000
      }
    );
  }

  disputeStateEvent(channel: channel, from, to) {
    let instance = this.Channel.at(channel.address);

    instance.disputeAccepted({fromBlock:0}).watch((error, result) => {
      if (error != null) {
        alert('There was an error getting event dispute state from channel ' + channel.address);
        return;
      }
      console.log("Dispute from "+ result.args.end + " accepted with id " + result.args.currentId);
      
      return;
    });

  }

  async closeChannel(contract, self, bool): Promise<any> {
    let instance = await this.Channel.at(contract);

    return instance.closeChannel(
      bool,
      {
        from: self,
        gas: 300000
      }
    );
  }

  channelCloseRequestEvent(channel: channel, from, to) {
    let instance = this.Channel.at(channel.address);

    instance.closeRequest({fromBlock:0}).watch((err, res) => {
      if (err != null) {
        alert('There was an error getting event close request from channel ' + channel.address);
        return;
      }

      console.log("Close request from " + res.args.end + " changed to " + res.args.closeChange);

    });

  }

  async unlockFunds(contract, self): Promise<any> {
    let instance = await this.Channel.at(contract);

    return instance.unlockFunds(
      {
        from: self,
        gas: 300000
      }
    );
  }

  channelCloseEvent(channel: channel, from, to) {
    let instance = this.Channel.at(channel.address);

    let ev = instance.channelClosed({fromBlock:0}).watch((err, res) => {
      if (err != null) {
        alert('There was an error getting event close from channel ' + channel.address);
        return;
      }

      channel.setClosed();
      channel.nearEndValue = res.args.nearEndFinalValue;
      channel.farEndValue = res.args.farEndFinalValue;
      channel.id = res.args.finalId;

      console.log("Channel closed");
      ev.stopWatching();
    });

  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}