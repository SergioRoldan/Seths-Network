import { Component, OnInit, OnDestroy } from '@angular/core';
import { Web3Service } from '../web3.service';
import { channel } from '../../util/channel';
import { ActivatedRoute } from '@angular/router';
import { account } from '../../util/account';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css']
})
export class ChannelsComponent implements OnInit, OnDestroy {

  channels: channel[] = [];
  account: account;

  private sub: any;

  selectedChannel: channel;

  constructor(private route: ActivatedRoute, private web3Service: Web3Service) { }

  ngOnInit() {
    this.sub = this.route.parent.params.subscribe(params => this.account = JSON.parse(params['account']));
    this.web3Service.channels$.subscribe(channels => {
      this.channels = channels.get(this.account.address);
    });
  }

  ngOnDestroy(){
    this.sub.unsubscribe();
  }

  selectChannel(channel: channel) {
    this.selectedChannel = channel;
  }
}
