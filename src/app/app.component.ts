import {Component} from '@angular/core';

import {channel} from '../util/channel';
import {Web3Service} from './web3.service';
import {account} from '../util/account';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  accounts: account[] = [];  
  channels: channel[] = [];

  /*mainAddress = "0xf17f52151EbEF6C7334FAD080c5704D77216b732";

  createAmount: number;
  recipientAddress: string;
  daysOpen: number;

  channelAddress: string;
  acceptAmount: number;

  status_create: string;
  status_accept: string;

  canBeAddress = canBeAddress;
  canBeDays = canBeDays;*/

  constructor(private web3Service: Web3Service) {}

  ngOnInit() {
    this.updateAccounts();
  }

  updateAccounts() {
    let lastLength = 0;
    
    this.web3Service.accounts$.subscribe(accounts => {

      if(accounts.length != lastLength && accounts.length > 0) {
        this.web3Service.channelProcessedEvent(accounts[lastLength].address, 0);
        lastLength = accounts.length;
        console.log(lastLength); 
      }
          
      console.log('Address update fired! ', accounts);
        
    });
  }

  /*updateChannels(address) {
    let lastLenght = 0;
    this.web3Service.channels$.subscribe(channels => {
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
      this.status_accept = message
  }
  
  createChannel() {

    const amount = this.createAmount;
    const receiver = this.recipientAddress;
    const days = this.daysOpen;

    this.setStatus('Initiating transaction... (please wait)', 'create');

    this.web3Service.createNewChannel(this.accounts[0].address, receiver, amount, days).then(result => {
      if (result.receipt.status == 1) {
        this.setStatus('Transaction complete!', 'create');
        this.web3Service.updateBalance(this.accounts[0]);
      }
      else if (result.receipt.status == 0)
        this.setStatus('Error creating channel, EVM state reverted', 'create');
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
        this.setStatus('Error accepting channel, EVM state reverted.', 'accept');
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
  }*/
}

/*export interface Accounts {
  address: any;
  balance: any;
}*/
