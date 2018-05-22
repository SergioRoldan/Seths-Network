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
  //transactions: transaction[] = [];
  web3: any;

  createAmount: number;
  recipientAddress: string;
  daysOpen: number;
  channelAddress: string;

  status_create: string;
  status_accept: string;

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

  updateState() {
    //this.web3Service.getTransactions().subscribe(trans => this.transactions = trans);
  }

  setStatus(message: string, status: string) {
    if(status == 'create')
      this.status_create = message;
    else if(status == 'accept')
      this.status_create = message
  }
  
  createChannel() {

    const amount = this.createAmount;
    const receiver = this.recipientAddress;
    const days = this.daysOpen;

    this.setStatus('Initiating transaction... (please wait)', 'create');

    this.web3Service.createNewChannel(receiver, amount, days).then(result => {
      if (result.receipt.status == 1)
        this.setStatus('Transaction complete!', 'create');
      else if (result.receipt.status == 0)
        this.setStatus('Error creating channel coin; see log.', 'create');
    }).catch(error => {
      console.log("Error creating the channel: "+error);
    });
    
  }

  acceptChannel() {
    const address = this.channelAddress;

    this.setStatus('Initiating transaction... (please wait)', 'accept');
    
    this.web3Service.acceptChannel(address).then(result => {
      if (result.receipt.status == 1)
        this.setStatus('Transaction complete!', 'accept');
      else if (result.receipt.status == 0)
        this.setStatus('Error creating channel coin; see log.', 'accept');
    }).catch(error => {
      console.log("Error accepting the channel: " + error);
    });
  }

  enoughEther(amount: string): boolean {
    if (!canBeNumber(amount))
      return false;

    if (+amount < 0 || +amount > (100000000000000000000))
      return false;

    return true;
  }
}
