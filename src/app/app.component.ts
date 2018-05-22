import {Component} from '@angular/core';

import {canBeAddress} from '../util/validation';
import {canBeDays} from '../util/validation';
import {canBeNumber} from '../util/validation';
import {channel} from '../util/channel';
import {Web3Service} from './web3.service';
import {account} from '../util/account';

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

  accounts: account[] = [];
  channels: channel[] = [];
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

  constructor(private web3Service: Web3Service) {

  }

  ngOnInit() {
    this.updateAccounts();
    this.updateChannels();
  }

  updateAccounts() {
    this.web3Service.getAccounts().subscribe(accs => this.accounts = accs);
  }

  updateChannels() {
    this.web3Service.getChannels().subscribe(channs => this.channels = channs);
  }
  
  createChannel(){}

  setStatus(message: string) {
    this.status = message;
  }
  /*
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
  }*/

  enoughEther(amount: string): boolean {
    if (!canBeNumber(amount))
      return false;

    if (+amount < 0 || +amount > this.nearBalance || +amount > (100000000000000000000))
      return false;

    return true;
  }
}
