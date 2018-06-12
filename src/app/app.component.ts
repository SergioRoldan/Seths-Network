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

  //Declare a mutex, required due to the asynchronous nature of 80% of app functions when checking if a new item has been
  //added to an obsevable
  mutex: Mutex;

  totalNotifications: number;


  constructor(private web3Service: Web3Service, private nedbService: NedbService, 
    private notificationsService: NotificationsService, public router: Router) {
    this.mutex = new Mutex();
  }

  ngOnInit() {
    //Subscribe to notification observable & update accounts
    this.notificationsService.total$.subscribe(total => this.totalNotifications = total);
    this.updateAccounts();
  }

  //Update accounts and each of the channels of these accounts
  updateAccounts() {

    let lastLength = 0;
    
    //Subscribe to account observable
    this.web3Service.accounts$.subscribe(accounts => {

      //Acquire mutex
      this.mutex.acquire().then(release => {
        //Check if the observable update contains account and if any of them if new
        if (accounts.length != lastLength && accounts.length > 0) {

          for(let i=lastLength; i< accounts.length; i++) {
            //Update channels for each of the accounts
            this.updateChannels(accounts[i].address);
            console.log('New address fired!');
            //Get channels for each of the accounts
            this.nedbService.getChannels(accounts[i].address).then(val => {
              //Update the source of channels observable
              for(let v of val) {
                this.web3Service.updateChannelsSource(accounts[i].address, v, false, true);
              }

            }).catch(e => {
              console.log("Error listenig for channels ", e);
            });
            //Small delay to allow the app to subscribe and receive channels before start listening for events
            this.web3Service.sleep(1000).then(() => {
              this.web3Service.channelProcessedEventFar(accounts[i]);
              this.web3Service.channelProcessedEventNear(accounts[i]);
            });
            
          }
          
          lastLength = accounts.length;
        }

        release();
      }).catch(error => {
        console.log("Mutex error: ", error)
      });
        
    });
  }

  //Update channels of certain account and start listen for all channel events
  updateChannels(address) {
    let lastLenght = 0;

    //Subscribe to channels observable
    this.web3Service.channels$.subscribe(channels => {
      //Check if channels is initialized and if any new channel linked with the account has been added
      if (channels.size > 0 && channels.get(address).length != lastLenght) {
        for(let i=lastLenght; i<channels.get(address).length; i++) {
          //Listen for all event of a channel
          this.listenChannelEvents(channels.get(address)[i], address);
          console.log("New channel fired!");
        }

        lastLenght = channels.get(address).length;
      }
       
    });
  }
  
  //Listen for all events of a channel including accepted, updated, disputed, close requested, closed and randoms shown
  listenChannelEvents(channel: channel, address) {
    this.web3Service.channelAcceptedEvent(address, channel);
    this.web3Service.updateStateEvent(address, channel);
    this.web3Service.disputeStateEvent(address, channel);
    this.web3Service.channelCloseRequestEvent(address, channel);
    this.web3Service.channelCloseEvent(address, channel);
    this.web3Service.randomShownEvent(address, channel);
  }

  //Navigate to notifications
  navigateNotifications() {
    this.router.navigate(['/notifications']);
  }

  //Drop dbs
  dropDBs() {
    this.nedbService.dropDBs();
  }


}