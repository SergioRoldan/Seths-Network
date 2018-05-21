import {Component} from '@angular/core';
import {canBeAddress} from '../util/validation';
import {canBeDays} from '../util/validation';
import {canBeNumber} from '../util/validation';
import {channel} from '../util/channel';

const Web3 = require('web3');
const Web3Utils = require('web3-utils');
const contract = require('truffle-contract');
const factoryArtifacts = require('../../build/contracts/Factory.json');
const channelArtifacts = require('../../build/contracts/ChannelFinal.json');


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  Factory = contract(factoryArtifacts);
  Channel = contract(channelArtifacts);

  accounts: any;
  web3: any;

  near: any;
  nearBalance: any;
  far: any;
  farBalance: any;

  createAmount: number;
  recipientAddress: string;
  daysOpen: number;

  status: string;

  canBeAddress = canBeAddress;
  canBeDays = canBeDays;

  channelInfo: channel;

  constructor() {
    this.checkAndInstantiateWeb3();
    this.onReady();
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

  onReady() {
    
    // Fix difference for httpProvider bettween web3 v1 and web3 v0.20 used by truffle-contract
    Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send

    // Bootstrap the abstractions for Use.
    this.Factory.setProvider(this.web3.currentProvider);
    this.Channel.setProvider(this.web3.currentProvider);

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
      this.accounts = accs;

      this.near = this.accounts[0];

      this.web3.eth.getBalance(this.near, (err, val) => {
        if (err != null) {
          alert('There was an error fetching balance.');
          return;
        }
        this.nearBalance = this.web3.utils.fromWei(val);
      });
      
      this.far = this.accounts[1];
      this.web3.eth.getBalance(this.far , (err, val) => {
        if (err != null) {
          alert('There was an error fetching balance.');
          return;
        }
        this.farBalance = this.web3.utils.fromWei(val);
      });

    });
  }


  setStatus(message: string) {
    this.status = message;
  }

  createChannel() {

    const amount = this.createAmount;
    const receiver = this.recipientAddress;
    const days = this.daysOpen;

    let factory;

    this.setStatus('Initiating transaction... (please wait)');

    this.Factory.deployed()
      .then((instance) => {
        factory = instance;
        return factory.createChannel(receiver, days, {
          from: this.accounts[0],
          gas: 3000000,
          value: this.web3.utils.toWei(amount, 'ether')
        });
      })
      .then(() => {
        this.setStatus('Transaction complete!');
        factory.channelProcessed().watch((error, results) => {
          if(!error) {
            let tmp = results.args;
            this.channelInfo = new channel(tmp.ContractAddrs, tmp.NearEnd, tmp.FarEnd, this.web3.utils.fromWei(tmp.channelVal.toString()), tmp.endDate);
            console.log(tmp.channelVal, ' ', tmp.endDate);
          }
        });
      })
      .catch((e) => {
        console.log(e);
        this.setStatus('Error creating channel coin; see log.');
      });
  }

  enoughEther(amount: string): boolean {
    if (!canBeNumber(amount))
      return false;

    if (+amount < 0 || +amount > this.nearBalance || +amount > (100000000000000000000))
      return false;

    return true;
  }
}
