import {Component} from '@angular/core';

import {channel} from '../util/channel';
import {Web3Service} from './web3.service';
import {account} from '../util/account';
import {Mutex, MutexInterface} from 'async-mutex';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  mutex: Mutex;


  constructor(private web3Service: Web3Service) {
    this.mutex = new Mutex();
  }

  ngOnInit() {
    this.updateAccounts();
  }

  updateAccounts() {
    let lastLength = 0;
    
    this.web3Service.accounts$.subscribe(accounts => {

      this.mutex.acquire().then(function (release) {
        if (accounts.length != lastLength && accounts.length > 0) {

          this.web3Service.channelProcessedEvent(accounts[lastLength].address, 0);
          this.updateChannels(accounts[lastLength].address);
          lastLength = accounts.length;
          console.log('New address fired!');
        }

        release();
      });
        
    });
  }

  updateChannels(address) {
    let lastLenght = 0;

    this.web3Service.channels$.subscribe(channels => {

      this.mutex.acquire().then(function(release) {
        if (channels.size > 0 && channels.get(address).length != lastLenght) {
          this.listenChannelEvents(channels.get(address)[lastLenght], address);
          lastLenght = channels.get(address).length;
          console.log("New channel fired!");
        }
        
        release();
      });
    });
  }
  
  listenChannelEvents(channel: channel, address) {
    this.web3Service.channelAcceptedEvent(address, channel, 0);
    this.web3Service.updateStateEvent(address, channel, 0);
    this.web3Service.disputeStateEvent(address, channel, 0);
    this.web3Service.channelCloseRequestEvent(address, channel, 0);
    this.web3Service.channelCloseEvent(address, channel, 0);
  }

}