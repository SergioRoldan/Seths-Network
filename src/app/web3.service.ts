import { Injectable, OnInit } from '@angular/core';
import { channel } from '../util/channel';
import { account } from '../util/account';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { updateParams } from '../util/updateParams';
import { NedbService } from './nedb.service';

const Web3 = require('web3');
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

  accounts$ = this.accountsSource.asObservable();
  channels$ = this.channelsSource.asObservable();
  
  constructor(private neDBService: NedbService) {
    this.checkAndInstantiateWeb3();
    this.retrieveAccountsFromDB();
    this.retrieveAccountsFromEth();
    this.setProviders();
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
    
  }

  retrieveAccountsFromDB() {

    this.neDBService.getAccounts().then(val => {
      this.accounts = val;
      for(let acc of this.accounts) {
        this.channels.set(acc.address, []);
        this.updateBalance(acc);
      }
    }).catch(e => {
      console.log(e);
    });
  }

  retrieveAccountsFromEth() {
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

          let found = false;

          for (let v of this.accounts)
            if (v.address == acc)
              found = true;

          if (!found) {
            let tmp = new account(acc, this.web3.utils.fromWei(val.toString()));
            this.channels.set(acc, []);
            this.updateAccountSource(tmp);
          }

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

  channelProcessedEventFar(self) {
    this.Factory.deployed()
      .then((instance) => {
        
        let ev = instance.channelProcessed({ FarEnd: self.address }, { fromBlock: self.lastBlockScr + 1 });
        
        ev.watch((err, res) => {
          if (err != null) {
            alert('There was an error getting event for account X');
            return;
          }

          console.log("-> New channel far event catched")
          
          let tmp = new channel(
            res.args.ContractAddrs,
            res.args.NearEnd,
            res.args.FarEnd,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            res.args.endDate,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            0
          )

          this.updateLastBlock(res.blockNumber);
          this.updateBalance(self);
          this.updateChannelsSource(self.address, tmp);

        });

      });
  }

  channelProcessedEventNear(self) {
    this.Factory.deployed()
      .then((instance) => {

        let ev2 = instance.channelProcessed({ NearEnd: self.address }, { fromBlock: self.lastBlockScr +1 });

        ev2.watch((err, res) => {
          if (err != null) {
            alert('There was an error getting event for account X');
            return;
          }

          console.log("-> New channel near event catched")
          
          let tmp = new channel(
            res.args.ContractAddrs,
            res.args.NearEnd,
            res.args.FarEnd,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            res.args.endDate,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            0
          )

          this.updateLastBlock(res.blockNumber);
          this.updateBalance(self);
          this.updateChannelsSource(self.address, tmp);

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

  channelAcceptedEvent(self, channel: channel): any {

    let instance = this.Channel.at(channel.address);
    
    let evt = instance.channelAccepted({}, { fromBlock: channel.lastBlockScr +1 });
    
    evt.watch((error, result) => {
      if (error != null) {
        alert('There was an error getting event accepted from channel ' + channel);
        return;
      }

      console.log("-> Accept event catched");
      
      channel.value = this.web3.utils.fromWei(result.args.totalValue.toString());
      channel.accepted = true;
      channel.farEndValue = this.web3.utils.fromWei(result.args.farEndValue.toString());

      this.updateLastBlock(result.blockNumber);
      this.updateChannelsSource(self, channel, true);
      
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

  async updateState(contract, self, updateParameters: updateParams): Promise<any> {
    let instance = await this.Channel.at(contract);

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

  updateStateEvent(self, channel: channel): any {
    let instance = this.Channel.at(channel.address);
    
    let ev  = instance.stateUpdated({}, {fromBlock: channel.lastBlockScr +1 });
    
    ev.watch((err, res) => {
      if(err != null) {
        alert('There was an error getting event update state from channel ' + channel.address);
        return;
      }

      console.log("-> Update event catched");

      channel.id = res.args.currentId;

      if(res.args.sender.toLowerCase() == channel.nearEnd.toLowerCase()) {
        channel.nearEndValue = this.web3.utils.fromWei(res.args.senderValue.toString());
        channel.farEndValue = this.web3.utils.fromWei(res.args.uploaderValue.toString());
      } else if(res.args.sender.toLowerCase() == channel.farEnd.toLowerCase()) {
        channel.nearEndValue = this.web3.utils.fromWei(res.args.uploaderValue.toString());
        channel.farEndValue = this.web3.utils.fromWei(res.args.senderValue.toString());
      }
      
      this.updateLastBlock(res.blockNumber);
      this.updateChannelsSource(self, channel, true);
    });

    return ev;

  }

  randomShowedEvent(self, channel: channel) {
    let instance = this.Channel.at(channel.address);
    
    let ev = instance.rsShownAndUsed({} ,{fromBlock: channel.lastBlockScr +1} )
    
    ev.watch((err, res) => {
      if (err != null) {
        alert('There was an error getting event random showed from channel ' + channel.address);
        return;
      }

      channel.getRsShowed(res.args.random);
      
      this.updateLastBlock(res.blockNumber);
      this.updateChannelsSource(self, channel, true);
    });
  }

  async disputeState(contract, self, disputeParameters): Promise<any> {
    let instance = await this.Channel.at(contract);

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

  disputeStateEvent(self, channel: channel) {

    let instance = this.Channel.at(channel.address);

    let ev = instance.disputeAccepted({}, {fromBlock: channel.lastBlockScr +1})
    
    ev.watch((error, result) => {
      if (error != null) {
        alert('There was an error getting event dispute state from channel ' + channel.address);
        return;
      }
      
      console.log("-> Dispute event catched");

      channel.id = result.args.currentId;

      this.updateLastBlock(result.blockNumber);
      this.updateChannelsSource(self, channel, true);

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

  channelCloseRequestEvent(self, channel: channel) {
    let instance = this.Channel.at(channel.address);
    
    let ev = instance.closeRequest({}, {fromBlock: channel.lastBlockScr +1})
    
    ev.watch((err, res) => {
      if (err != null) {
        alert('There was an error getting event close request from channel ' + channel.address);
        return;
      }

      this.updateLastBlock(res.blockNumber);
      console.log("Close request from " + res.args.end + " catched: " + res.args.closeChange);

      //this.updateChannelsSource(self, channel, true);
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

  channelCloseEvent(self, channel: channel) {
    let instance = this.Channel.at(channel.address);

    let ev = instance.channelClosed({}, {fromBlock: channel.lastBlockScr +1})
    
    ev.watch((err, res) => {
      if (err != null) {
        alert('There was an error getting event close from channel ' + channel.address);
        return;
      }

      channel.setClosed();
      channel.nearEndValue = this.web3.utils.fromWei(res.args.nearEndFinalValue.toString());
      channel.farEndValue = this.web3.utils.fromWei(res.args.farEndFinalValue.toString());
      channel.id = res.args.finalId

      console.log("-> Close event catched");

      this.updateLastBlock(res.blockNumber);
      this.updateChannelsSource(self, channel, true);
    });

  }

  updateAccountSource(account: account, modify = false) {
    if (modify) {
      this.accounts.forEach((item, index) => {
        if (item.address == account.address) {
          this.accounts[index] = account;
          this.neDBService.updateAccount(account);
          this.accountsSource.next(this.accounts);
        }
      });
    } else {
      this.accounts.push(account);
      this.neDBService.insertAccount(account);
      this.accountsSource.next(this.accounts);
    }

  }

  updateChannelsSource(account: any, channel: channel, modify = false, inDb = false) {

    if (modify) {

      this.channels.get(account).forEach((item, index) => {
        if (item.address == channel.address) {
          this.channels.get(account)[index] = channel;
          this.neDBService.updateChannel(account, channel);
        }
      });

    } else if(inDb) {
      this.channels.get(account).push(channel);

    } else if (!this.channels.get(account).includes(channel)) {
      let found = false;

      this.channels.get(account).forEach((item, index) => {
        if (item.address == channel.address)
          found = true;
      });

      if (!found) {
        this.channels.get(account).push(channel);
        this.neDBService.insertChannel(account, channel);
      }
    }


    this.channelsSource.next(this.channels);
  }

  updateBalance(account: account) {
    this.web3.eth.getBalance(account.address, (err, val) => {
      if (err != null) {
        alert('There was an error fetching balance of account ' + account.address + ': ' + err);
        return;
      }
      account.balance = this.web3.utils.fromWei(val.toString());
      this.updateAccountSource(account, true);
    });
  }

  //Utils

  updateLastBlock(lastBlockScrutinized) {
    for(let acc of this.accounts) {
      acc.lastBlockScr = lastBlockScrutinized;
      this.neDBService.updateAccount(acc);

      let channs = this.channels.get(acc.address);

      for(let chann of channs) {
        chann.lastBlockScr = lastBlockScrutinized;
        this.neDBService.updateChannel(acc.address, chann);
      }
    }
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

}