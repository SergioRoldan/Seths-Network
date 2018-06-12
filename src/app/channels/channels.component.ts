import { Component, OnInit, OnDestroy } from '@angular/core';
import { Web3Service } from '../web3.service';
import { channel } from '../../util/channel';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(private route: ActivatedRoute, private web3Service: Web3Service, private router: Router) { }

  //Subscribe to the parameter encoded in the URL and the channels observables
  ngOnInit() {
    this.sub = this.route.parent.params.subscribe(params => this.account = JSON.parse(params['account']));
    this.web3Service.channels$.subscribe(channels => {
      this.channels = channels.get(this.account.address);
    });
  }

  ngOnDestroy(){
    this.sub.unsubscribe();
  }

  //Navigate to the selected channel
  selectChannel(channel: channel) {
    this.selectedChannel = channel;
    this.router.navigate(['channels', JSON.stringify(channel)], { relativeTo: this.route });
  }

  //Navigate to operations with operation create
  goCreate() {
    this.router.navigate(['ethereum', JSON.stringify({
      'operation': 'create',
      'channel': ''
    })], {relativeTo: this.route});
  }

}
