import {Component} from '@angular/core';

import {canBeAddress} from '../util/validation';
import {canBeDays} from '../util/validation';
import {canBeNumber} from '../util/validation';
import {channel} from '../util/channel';
import {Web3Service} from './web3.service';
import {account} from '../util/account';


//const Web3 = require('web3');
//const Web3Utils = require('web3-utils');
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

  mainAddress = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";

  createAmount: number;
  recipientAddress: string;
  daysOpen: number;

  channelAddress: string;
  acceptAmount: number;

  status_create: string;
  status_accept: string;

  canBeAddress = canBeAddress;
  canBeDays = canBeDays;

  constructor(private web3Service: Web3Service) {}

  ngOnInit() {
    this.updateAccounts();
    this.updateChannels(this.mainAddress);
  }

  updateAccounts() {
    this.web3Service.accs.subscribe(accounts => {
      if(this.accounts.length == 0) {
        this.web3Service.channelProcessedEvent(this.mainAddress, 0, 'latest');
      }
      this.accounts = accounts;
      //console.log("Accounts fired: ", accounts);
    });
  }

  updateChannels(address) {
    let lastLenght = 0;
    this.web3Service.channs.subscribe(channels => {
      if(channels.size > 0) {
        if(channels.get(address).length != lastLenght) {
          this.retrieveAccept(channels.get(address)[lastLenght]);
          lastLenght = channels.get(address).length;
        }
        this.channels = channels.get(address);
      }
      
      console.log("Channels fired: ", channels);
    });
  }

  updateState() {
    //this.web3Service.getTransactions().subscribe(trans => this.transactions = trans);
  }

  retrieveAccept(channel: channel, address = this.mainAddress) {
    this.web3Service.channelAcceptedEvent(
      address,
      channel,
      0,
      'latest'
    );
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

    //console.log(this.accounts)

    this.setStatus('Initiating transaction... (please wait)', 'create');

    this.web3Service.createNewChannel(this.accounts[0].address, receiver, amount, days).then(result => {
      if (result.receipt.status == 1) {
        this.setStatus('Transaction complete!', 'create');
        this.web3Service.updateBalance(this.accounts[0]);
      }
      else if (result.receipt.status == 0)
        this.setStatus('Error creating channel coin; see log.', 'create');
    }).catch(error => {
      console.log("Error creating the channel: "+error);
    });
    
  }

  acceptChannel() {
    const address = this.channelAddress;
    const value = this.acceptAmount;

    this.setStatus('Initiating transaction... (please wait)', 'accept');
    
    this.web3Service.acceptChannel(address, this.accounts[1].address, value).then(result => {
      if (result.receipt.status == 1) {
        this.setStatus('Transaction complete!', 'accept');
        this.web3Service.updateBalance(this.accounts[1]);
      }
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
