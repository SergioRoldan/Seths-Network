import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Web3Service } from '../web3.service';
import { canBeAddress, canBeDays, canBeNumber, canBeSignature } from '../../util/validation';
import { account } from '../../util/account';
import { channel } from '../../util/channel';
import { updateParams } from '../../util/updateParams';

@Component({
  selector: 'app-operation',
  templateUrl: './operation.component.html',
  styleUrls: ['./operation.component.css']
})
export class OperationComponent implements OnInit, OnDestroy {

  operation: string;
  account: account;
  channel: channel;

  subAccount: any;
  subOperation: any;

  createAmount: number;
  recipientAddress: string;
  daysOpen: number;
  status_create: string;

  updateAmount: number;
  updateId: number;
  updateSender: string;
  updateSignature: string;
  status_update: string;

  status_dispute: string;

  updateRandoms: any;
  updateTTLs: any;
  updateRHVals: any;
  updateDirection: any;

  canBeAddress = canBeAddress;
  canBeDays = canBeDays;
  canBeNumber = canBeNumber;
  canBeSignature = canBeSignature;

  constructor(public router: Router, private route: ActivatedRoute, private web3Service: Web3Service) { }

  ngOnInit() {
    this.subAccount = this.route.parent.params.subscribe(params => this.account = JSON.parse(params['account']));
    this.subOperation = this.route.params.subscribe(params => {
      let options = JSON.parse(params['options']);

      this.operation = options['operation'];

      if(options['channel'] != null && options['channel'] != '') 
        this.channel = options['channel'];
      
    });
  }

  ngOnDestroy() {
    this.subAccount.unsubscribe();
    this.subOperation.unsubscribe();
  }

  createChannel() {
    const createAmount = this.createAmount;
    const createReceiver = this.recipientAddress;
    const createDays = this.daysOpen;

    this.setStatus('Initiating transaction... (please wait)', 'create');

    this.web3Service.createNewChannel(this.account.address, createReceiver, createAmount, createDays).then(result => {
      if (result.receipt.status == 1) {
        this.setStatus('Transaction complete!', 'create');
        this.web3Service.updateBalance(this.account);
        this.web3Service.sleep(1000).then(() => this.router.navigate(['../../'], {relativeTo: this.route}))
      }
      else if (result.receipt.status == 0)
        this.setStatus('Error creating channel, EVM state reverted', 'create');
    }).catch(error => {
      console.log("Error creating the channel: " + error);
    });

  }

  updateChannel() {
    this.setStatus('Initiating transaction... (please wait)', 'update');

    const send = this.updateAmount;
    const sender = this.updateSender;
    const id = this.updateId;
    const signature = this.updateSignature || '';
    const chann = this.channel.address;
    let amount = 0;

    let dirs;
    let ttls;
    let rs;
    let rhvals;

    if (this.updateRandoms && this.updateTTLs && this.updateRHVals && this.updateDirection) {
      rs = this.updateRandoms.split(';');
      ttls = this.updateTTLs.split(';');
      rhvals = this.updateRHVals.split(';');
      dirs = this.updateDirection.split(';');
    } else {
      rs = [];
      ttls = [];
      rhvals = [];
      dirs = [];
    }

    if(sender.toString().toLowerCase() == this.channel.farEnd.toString().toLowerCase()) {
      amount = this.channel.farEndValue - send;
      for(let i=0; i< dirs.length; i++) 
        dirs[i] = ((dirs[i] == 0) ? 1 : 0);   
    }
    else if(sender.toString().toLowerCase() == this.channel.nearEnd.toString().toLowerCase()) 
      amount = this.channel.nearEndValue - send;
  
    if(amount > 0) {

      let params = new updateParams(this.web3Service.web3, sender, chann, amount, id, signature, rs, ttls, rhvals, dirs);

      this.web3Service.updateState(this.channel.address, this.account.address, params).then(result => {
        if (result.receipt.status == 1) {
          this.channel.paramToChann(params);
          this.web3Service.updateBalance(this.account);
          this.setStatus('Transaction complete!', 'update');
          this.web3Service.sleep(1000).then(() => this.router.navigate(['../../'], { relativeTo: this.route }))
        }
        else if (result.receipt.status == 0)
          this.setStatus('Error updating channel, EVM state reverted', 'update');
      }).catch(error => {
        console.log("Error updating the channel: " + error);
      });
    }

  }

  disputeState() {
    this.setStatus('Initiating transaction... (please wait)', 'dispute');

    const send = this.updateAmount;
    const sender = this.updateSender;
    const id = this.updateId;
    const signature = this.updateSignature || '';
    const chann = this.channel.address;
    let amount = 0;

    let dirs;
    let ttls;
    let rs;
    let rhvals;

    if (this.updateRandoms && this.updateTTLs && this.updateRHVals && this.updateDirection) {
      rs = this.updateRandoms.split(';');
      ttls = this.updateTTLs.split(';');
      rhvals = this.updateRHVals.split(';');
      dirs = this.updateDirection.split(';');
    } else {
      rs = [];
      ttls = [];
      rhvals = [];
      dirs = [];
    }

    if (sender.toString().toLowerCase() == this.channel.farEnd.toString().toLowerCase()) {
      amount = this.channel.farEndValue - send;
      for (let i = 0; i < dirs.length; i++)
        dirs[i] = ((dirs[i] == 0) ? 1 : 0);
    }
    else if (sender.toString().toLowerCase() == this.channel.nearEnd.toString().toLowerCase())
      amount = this.channel.nearEndValue - send;

    if (amount > 0) {

      let params = new updateParams(this.web3Service.web3, sender, chann, amount, id, signature, rs, ttls, rhvals, dirs);

      this.web3Service.disputeState(this.channel.address, this.account.address, params).then(result => {
        if (result.receipt.status == 1) {
          this.channel.paramToChann(params);
          this.web3Service.updateBalance(this.account);
          this.setStatus('Transaction complete!', 'dispute');
          this.web3Service.sleep(1000).then(() => this.router.navigate(['../../'], { relativeTo: this.route }))
        }
        else if (result.receipt.status == 0)
          this.setStatus('Error disputing state, EVM state reverted', 'dispute');
      }).catch(error => {
        console.log("Error disputing state: " + error);
      });
    }

  }

  setStatus(message: string, operation: string) {
    if(operation == 'create')
      this.status_create = message;
    else if(operation = 'update')
      this.status_update = message;
    else if(operation = 'dispute')
      this.status_dispute = message;
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  enoughEther(amount: string): boolean {
    if (!canBeNumber(amount))
      return false;

    if (+amount < 0 || +amount > 100 || +amount > +this.account.balance)
      return false;

    return true;
  }

  enoughEtherChannel(amount: string): boolean {
    if (!canBeNumber(amount))
      return false;

    let myValue = 0;

    if (this.account.address.toLowerCase() == this.channel.farEnd.toLowerCase())
      myValue = this.channel.nearEndValue;
    else if (this.account.address.toLowerCase() == this.channel.nearEnd.toLowerCase())
      myValue = this.channel.farEndValue;

    if (+amount < 0 || +amount > 100 || +amount > myValue)
      return false;

    return true;
  }

  canBeBytes32(randoms:string): boolean {
    let rands = randoms.split(';');

    for(let rand of rands) 
      if(!canBeNumber(rand)  || rand.length != 66)
        return false;

    return true;
  }

  canBeNumbers(numbers: string): boolean {
    let num = numbers.split(';');

    for (let n of num)
      if (!canBeNumber(n))
        return false;

    return true;
  }

}
