import {Component, OnInit} from '@angular/core';

import {channel} from '../util/channel';
import {Web3Service} from './web3.service';
import {NedbService} from './nedb.service';
import {account} from '../util/account';
import {Mutex, MutexInterface} from 'async-mutex';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  mutex: Mutex;


  constructor(private web3Service: Web3Service, private nedbService: NedbService) {
    this.mutex = new Mutex();
  }

  ngOnInit() {
    this.updateAccounts();
  }

  updateAccounts() {
    let lastLength = 0;
    
    this.web3Service.accounts$.subscribe(accounts => {

      this.mutex.acquire().then(release => {
        if (accounts.length != lastLength && accounts.length > 0) {
          this.web3Service.channelProcessedEventFar(accounts[lastLength].address, 0);
          this.web3Service.channelProcessedEventNear(accounts[lastLength].address, 0);
          this.updateChannels(accounts[lastLength].address);
          console.log('New address fired!', accounts[lastLength].address, lastLength);
          lastLength = accounts.length;
        }

        release();
      }).catch(error => {
        console.log("Mutex error: ", error)
      });
        
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
    this.web3Service.disputeStateEvent(address, channel, 0);
    this.web3Service.channelCloseRequestEvent(address, channel, 0);
    this.web3Service.channelCloseEvent(address, channel, 0);
    this.web3Service.randomShowedEvent(address, channel, 0);
  }

}