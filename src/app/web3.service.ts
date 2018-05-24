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

  updateAccountSource(account: account) {
    this.accounts.push(account);
    this.accountsSource.next(this.accounts);
  }

  updateChannelsSource(channel: channel, account: any) {
    this.channels.get(account).push(channel);
    this.channelsSource.next(this.channels);
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

      console.log(accs);

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

  channelProcessedEvent(self, from) {
    this.Factory.deployed()
      .then((instance) => {

        instance.channelProcessed({ FarEnd: self }).watch((err, res) => {
          if (err != null) {
            alert('There was an error getting event for account X');
            return;
          }

          let tmp = new channel(
            res.args.ContractAddrs,
            res.args.NearEnd,
            res.args.FarEnd,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            res.args.endDate,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            0
          );

          this.updateChannelsSource(tmp, self);

          console.log("New channel processed ", this.channels);
          console.log(res);

          //Think of return the watch promises to stop them when close event fires
          /*
          this.channelAcceptedEvent(tmp, 0);
          this.updateStateEvent(tmp, 0);
          this.disputeStateEvent(tmp, 0);
          this.randomShowedEvent(tmp, 0);
          this.channelCloseRequestEvent(tmp, 0);
          this.channelCloseEvent(tmp, 0);
          */
        });

        instance.channelProcessed({ FarEnd: self }, { fromBlock: from, toBlock: 'latest' }).get((err, res) => {
          if (err != null) {
            alert('There was an error getting event for account X');
            return;
          }

          for (let chann of res) {
            let tmp = new channel(
              chann.args.ContractAddrs,
              chann.args.NearEnd,
              chann.args.FarEnd,
              this.web3.utils.fromWei(chann.args.channelVal.toString()),
              chann.args.endDate,
              this.web3.utils.fromWei(chann.args.channelVal.toString()),
              0
            );

            this.updateChannelsSource(tmp, self);

            console.log("New channel processed ", this.channels);
            console.log(res);

            /*
            this.channelAcceptedEvent(tmp, 0);
            this.updateStateEvent(tmp, 0);
            this.disputeStateEvent(tmp, 0);
            this.randomShowedEvent(tmp, 0);
            this.channelCloseRequestEvent(tmp, 0);
            this.channelCloseEvent(tmp, 0);
            */
          }

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

  channelAcceptedEvent(channel: channel, from) {

    let instance = this.Channel.at(channel.address);

    let ev = instance.channelAccepted().watch((error, result) => {
      if (error != null) {
        alert('There was an error getting event accepted from channel ' + channel.address);
        return;
      }
      channel.value = this.web3.utils.fromWei(result.args.totalValue.toString());
      channel.accepted = true;
      channel.farEndValue = this.web3.utils.fromWei(result.args.farEndValue.toString());

      console.log("Channel accepted");

      ev.StopWatching();
    });

    instance.channelAccepted({ fromBlock: from, toBlock: 'latest' }).get((error, result) => {
      if (error != null) {
        alert('There was an error getting event accepted from channel ' + channel.address);
        return;
      }
      
      if (result.length > 0) {
        channel.value = this.web3.utils.fromWei(result.args.totalValue.toString());
        channel.accepted = true;
        channel.farEndValue = this.web3.utils.fromWei(result.args.farEndValue.toString());

        console.log("Channel accepted");

        ev.StopWatching();
      }

    });

  }

  async acceptChannel(contract, self, value): Promise<any> {
    let instance = await this.Channel.at(contract);

    return instance.acceptChannel({
      from: self,
      gas: 300000,
      value: value
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

  updateStateEvent(channel: channel, from) {
    let instance = this.Channel.at(channel.address);

    instance.stateUpdated().watch((err, res) => {
      if(err != null) {
        alert('There was an error getting event update state from channel ' + channel.address);
        return;
      }

      channel.id = res.args.currentId;
      channel.nearEndValue = res.args.nearEndValue;
      channel.farEndValue = res.args.farEndValue;

      console.log("Channel state updated");
    });

    instance.stateUpdated({fromBlock: from, toBlock: 'latest'}).get((err, res) => {
      if (err != null) {
        alert('There was an error getting event update state from channel ' + channel.address);
        return;
      }

      for(let ch of res) {
        channel.id = ch.args.currentId;
        channel.nearEndValue = ch.args.nearEndValue;
        channel.farEndValue = ch.args.farEndValue;

        console.log("Channel state updated");
      }
      
    });
  }

  randomShowedEvent(channel: channel, from) {
    let instance = this.Channel.at(channel.address);

    instance.rsShownAndUsed().watch((err, res) => {
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

    instance.rsShownAndUsed({fromBlock: from, toBlock: 'latest'}).get((err, res ) => {
      if (err != null) {
        alert('There was an error getting event random showed from channel ' + channel.address);
        return;
      }

      for(let ev of res) {
        for (let ran in ev.args.random) {
          if (channel.checkRandomHashesInH(ran)) {
            channel.addRandomLock(ran)
            console.log("Random showed");
          }
        }
        for (let ran in ev.args.randomS) {
          if (channel.checkRandomHashesInH(ran)) {
            channel.addRandomLock(ran)
            console.log("Random showed");
          }
        }
      }

    })
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

  disputeStateEvent(channel: channel, from) {
    let instance = this.Channel.at(channel.address);

    instance.disputeAccepted().watch((error, result) => {
      if (error != null) {
        alert('There was an error getting event dispute state from channel ' + channel.address);
        return;
      }
      console.log("Dispute from "+ result.args.end + " accepted with id " + result.args.currentId);
      
      return;
    });

    instance.disputeAccepted({ fromBlock: from, toBlock: 'latest' }).get((err, res) => {
      if (err != null) {
        alert('There was an error getting event dispute state from channel ' + channel.address);
        return;
      }

      for(let ev of res) {
        console.log("Dispute from " + ev.args.end + " accepted with id " + ev.args.currentId);
      }

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

  channelCloseRequestEvent(channel: channel, from) {
    let instance = this.Channel.at(channel.address);

    instance.closeRequest().watch((err, res) => {
      if (err != null) {
        alert('There was an error getting event close request from channel ' + channel.address);
        return;
      }

      console.log("Close request from " + res.args.end + " changed to " + res.args.closeChange);

    });

    instance.closeRequest({fromBlock: from, toBlock: 'latest'}).get((err, res) => {
      if (err != null) {
        alert('There was an error getting event close request from channel ' + channel.address);
        return;
      }

      for(let ev of res)
        console.log("Close request from " + ev.args.end + " changed to " + ev.args.closeChange);

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

  channelCloseEvent(channel: channel, from) {
    let instance = this.Channel.at(channel.address);

    let ev = instance.channelClosed().watch((err, res) => {
      if (err != null) {
        alert('There was an error getting event close from channel ' + channel.address);
        return;
      }

      channel.setClosed();
      channel.nearEndValue = res.args.nearEndFinalValue;
      channel.farEndValue = res.args.farEndFinalValue;
      channel.id = res.args.finalId;

      console.log("Channel closed");
      ev.StopWatching();
    });

    instance.channelClosed({fromBlock: from, toBlock: 'latest'}).get((err, res) => {
      if (err != null) {
        alert('There was an error getting event close from channel ' + channel.address);
        return;
      }

      if(res.length > 0) {
        channel.setClosed();
        channel.nearEndValue = res.args.nearEndFinalValue;
        channel.farEndValue = res.args.farEndFinalValue;
        channel.id = res.args.finalId;

        console.log("Channel closed");
        ev.StopWatching();
      }
    });
  }
}