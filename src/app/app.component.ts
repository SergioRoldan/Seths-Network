import {Component, OnInit} from '@angular/core';

import {channel} from '../util/channel';
import {Web3Service} from './web3.service';
import {NedbService} from './nedb.service';
import {account} from '../util/account';
import {Mutex, MutexInterface} from 'async-mutex';
import { NotificationsService } from './notifications.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  mutex: Mutex;
  totalNotifications: number;


  constructor(private web3Service: Web3Service, private nedbService: NedbService, 
    private notificationsService: NotificationsService, public router: Router) {
    this.mutex = new Mutex();
  }

  ngOnInit() {
    this.notificationsService.total$.subscribe(total => this.totalNotifications = total);
    this.updateAccounts();
  }

  updateAccounts() {
    let lastLength = 0;
    
    this.web3Service.accounts$.subscribe(accounts => {

      this.mutex.acquire().then(release => {
        if (accounts.length != lastLength && accounts.length > 0) {

          for(let i=lastLength; i< accounts.length; i++) {
            
            this.updateChannels(accounts[i].address);
            console.log('New address fired!');

            this.nedbService.getChannels(accounts[i].address).then(val => {
              for(let v of val) {
                this.web3Service.updateChannelsSource(accounts[i].address, v, false, true);
              }

            }).catch(e => {
              console.log("Error listenig for channels ", e);
            });

            this.web3Service.sleep(1000).then(() => {
              this.web3Service.channelProcessedEventFar(accounts[i]);
              this.web3Service.channelProcessedEventNear(accounts[i]);
            })
            
          }
          
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
    this.web3Service.channelAcceptedEvent(address, channel);
    this.web3Service.updateStateEvent(address, channel);
    this.web3Service.disputeStateEvent(address, channel);
    this.web3Service.channelCloseRequestEvent(address, channel);
    this.web3Service.channelCloseEvent(address, channel);
    this.web3Service.randomShowedEvent(address, channel);
  }

  navigateNotifications() {
    this.router.navigate(['/notifications']);
  }


}