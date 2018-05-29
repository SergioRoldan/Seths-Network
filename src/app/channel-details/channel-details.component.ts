import { Component, OnInit, OnDestroy } from '@angular/core';
import { channel } from '../../util/channel';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from '../web3.service';
import { account } from '../../util/account';
import { canBeNumber} from '../../util/validation';

@Component({
  selector: 'app-channel-details',
  templateUrl: './channel-details.component.html',
  styleUrls: ['./channel-details.component.css']
})
export class ChannelDetailsComponent implements OnInit, OnDestroy {

  account: account;
  channel: channel;

  private subAcc: any;
  private subChann: any;

  acceptAmount: number;

  status: string;
  status_more: string;

  now: any;

  constructor(private route: ActivatedRoute, private web3Service: Web3Service, private router: Router) {
    this.now = Date.now();
   }

  ngOnInit() {
    this.subAcc = this.route.parent.params.subscribe(params => this.account = JSON.parse(params['account']));
    this.subChann = this.route.params.subscribe(params => this.channel = JSON.parse(params['channel']));
    this.web3Service.channels$.subscribe(channels => {
      for(let chann of channels.get(this.account.address))
        if(chann.address == this.channel.address) 
          this.channel = chann;
    });
    if (this.channel.endDate.getTime() < this.now)
      this.web3Service.sleep(this.now - this.channel.endDate.getTime()).then(() => this.now = Date.now());
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  goUpdate() {
    this.router.navigate(['../../ethereum', JSON.stringify({
      'operation': 'update',
      'channel': this.channel
    })], { relativeTo: this.route });
  }

  goDispute() {
    this.router.navigate(['../../ethereum', JSON.stringify({
      'operation': 'dispute',
      'channel': this.channel
    })], {relativeTo: this.route});
  }

  acceptChannel() {
    const value = this.acceptAmount;
    
    this.setStatus('Initiating transaction... (please wait)');

    this.web3Service.acceptChannel(this.channel.address, this.account.address, value).then(result => {
      if (result.receipt.status == 1) {
        this.setStatus('Transaction complete!');
        this.channel.accepted = true;
        this.web3Service.updateBalance(this.account);
      }
      else if (result.receipt.status == 0)
        this.setStatus('Error accepting channel, EVM state reverted.');
    }).catch(error => {
      console.log("Error accepting the channel: " + error);
    });
  }

  closeChannel() {
    this.web3Service.closeChannel(this.channel.address, this.account.address, true).then(result => {
      if (result.receipt.status == 1) {
        this.setStatus('Transaction complete!', 'more');
        this.web3Service.updateBalance(this.account);
      } else if(result.receipt.status == 0) 
        this.setStatus('Error closing the channel, EVM state reverted.', 'more');
    }).catch(error => {
      console.log("Error closing the channel: " + error);
    });
  }

  unlockFunds() {
    this.web3Service.unlockFunds(this.channel.address, this.account.address).then(result => {
      if (result.receipt.status == 1) {
        this.setStatus('Transaction complete!', 'more');
        this.channel.closed = true;
        this.web3Service.updateBalance(this.account);
      } else if (result.receipt.status == 0)
        this.setStatus('Error unlocking the channel, EVM state reverted.', 'more');
    }).catch(error => {
      console.log("Error unlocking the channel: " + error);
    });
  }

  setStatus(message: string, more?: string) {
    this.status = message;
    if(more && more == 'more')
      this.status_more = message;
  }

  enoughEther(amount: string): boolean {
    if (!canBeNumber(amount))
      return false;

    if (+amount < 0 || +amount > 100 || +amount > +this.account.balance)
      return false;

    return true;
  }

  ngOnDestroy(){
    this.subAcc.unsubscribe();
    this.subChann.unsubscribe();
  }
}
