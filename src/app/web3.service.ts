import { Injectable, OnInit } from '@angular/core';
import { channel } from '../util/channel';
import { account } from '../util/account';
import { Observable, of } from 'rxjs';
import { log } from 'util';

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
  channels: channel[] = [];
  
  constructor() {
    this.checkAndInstantiateWeb3();
    this.setProviders();
  }

  ngOnInit(){

  }

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

  setProviders() {

    // Fix difference for httpProvider bettween web3 v1 and web3 v0.20 used by truffle-contract
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send

    // Bootstrap the abstractions for Use.
    this.Factory.setProvider(this.web3.currentProvider);
    this.Channel.setProvider(this.web3.currentProvider);

  }

  getAccounts(): Observable<account[]> {

    // Get the initial account balance so it can be displayed.
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
          this.accounts.push(new account(acc, this.web3.utils.fromWei(val)));
        });
      }

    });

    return of(this.accounts);
  }

  getChannels(): Observable<channel[]> {

    this.Factory.deployed()
      .then((instance) => {

        instance.channelProcessed({}, {fromBlock: 0, toBlock: 'latest'}).get((err, res) => {
          if(err != null) {
            alert('There was an error getting event for account X');
            return;
          }

          for(let chann of res) {
            this.channels.push(new channel(
              chann.args.ContractAddrs, 
              chann.args.NearEnd, 
              chann.args.FarEnd, 
              this.web3.utils.fromWei(chann.args.channelVal.toString()), 
              chann.args.endDate
            ));
          }

        });

        instance.channelProcessed().watch((err, res) => {
          if(err != null) {
            alert('There was an error getting event for account X');
            return;
          }

          let tmp = new channel(
            res.args.ContractAddrs,
            res.args.NearEnd,
            res.args.FarEnd,
            this.web3.utils.fromWei(res.args.channelVal.toString()),
            res.args.endDate
          )

          this.channels.push(tmp);

          this.channelAcceptedEvent(tmp);

        });

      });

    return of(this.channels);
  }

  channelAcceptedEvent(channel: channel) {
    
    let instance = this.Channel.at(channel.address);

    instance.channelAccepted().watch((error, result) => {
      if(error != null) {
        alert('There was an error getting event accepted from channel '+channel.address);
        return;
      }

      channel.accepted = true;

      return;
    });

  }

  updateStateEvent(){

  }

  async createNewChannel(receiver, amount, days): Promise<any> {
    
    let instance = await this.Factory.deployed();

    return instance.createChannel(receiver, days, {
      from: this.accounts[0].address,
      gas: 3000000,
      value: this.web3.utils.toWei(amount, 'ether')
    });
      
  }

  async acceptChannel(address): Promise<any> {
    let instance = await this.Channel.at(address);

    return instance.acceptChannel({
      from: this.accounts[1].address,
      gas: 3000000
    });
  }

  /*async updateState(): Promise<any> {
    let instance = await this.Channel.at(address);

    return instance.({
      from: this.accounts[1].address,
      gas: 3000000
    });
  }*/

}