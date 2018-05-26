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


  /*createAmount: number;
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
        this.updateChannels(accounts[lastLength].address);
        lastLength = accounts.length;
        console.log('New address fired!'); 
      }
        
    });
  }

  updateChannels(address) {
    let lastLenght = 0;

    this.web3Service.channels$.subscribe(channels => {

      if (channels.size > 0 && channels.get(address).length != lastLenght) {
          this.listenChannelEvents(channels.get(address)[lastLenght], address);
          lastLenght = channels.get(address).length;
          console.log("New channel fired!");
      }

    });
  }
  
  listenChannelEvents(channel: channel, address) {
    this.web3Service.channelAcceptedEvent(address, channel, 0);
  }
  /*

  updateState() {
    //this.web3Service.getTransactions().subscribe(trans => this.transactions = trans);
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
