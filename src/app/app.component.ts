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
    this.web3Service.updateStateEvent(address, channel, 0);
  }

}