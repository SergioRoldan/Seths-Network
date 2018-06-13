import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Web3Service } from '../web3.service';
import { canBeAddress, canBeDays, canBeNumber, canBeSignature } from '../../util/validation';
import { account } from '../../util/account';
import { channel } from '../../util/channel';
import { updateParams } from '../../util/updateParams';
import { NotificationsService } from '../notifications.service';
import { notification } from '../../util/notification';

@Component({
  selector: 'app-operation',
  templateUrl: './operation.component.html',
  styleUrls: ['./operation.component.css']
})
export class OperationComponent implements OnInit, OnDestroy {

  operation: string;
  account: account;
  channel: channel;

  //Subscribers for observables
  subAccount: any;
  subOperation: any;

  //channelForm parameters
  createAmount: number;
  recipientAddress: string;
  daysOpen: number;
  status_create: string;

  //updateForm parameters
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

  //Imported validators
  canBeAddress = canBeAddress;
  canBeDays = canBeDays;
  canBeNumber = canBeNumber;
  canBeSignature = canBeSignature;

  constructor(public router: Router, private route: ActivatedRoute, private web3Service: Web3Service, 
    private notificationsService:NotificationsService) { }

  ngOnInit() {
    //Subscribe to account observable. Any route encoded parameter is seen as an observable to subscribe to. Parent is included 
    //to take the parameter of the parent route from a children defined in routing module
    this.subAccount = this.route.parent.params.subscribe(params => this.account = JSON.parse(params['account']));
    //Multiple parameters can be encoded in the URL at different levels or at the same using objects. Subscribe to operation
    this.subOperation = this.route.params.subscribe(params => {
      let options = JSON.parse(params['options']);
      this.operation = options['operation'];
      //Subscribe to channel if any
      if(options['channel'] != null && options['channel'] != '') 
        this.channel = options['channel'];
      
    });
  }

  //Unsubscribe on destroy
  ngOnDestroy() {
    this.subAccount.unsubscribe();
    this.subOperation.unsubscribe();
  }

  //Create channel form submit
  createChannel() {
    //Define constant variables for the form fields to avoid any change due to the double binding nature of the inputs during
    //the execution of the function
    const createAmount = this.createAmount;
    const createReceiver = this.recipientAddress;
    const createDays = this.daysOpen;

    //Set status
    this.setStatus('Initiating transaction... (please wait)', 'create');

    //Create new channel in the blockchain using web3service. Async, promise
    this.web3Service.createNewChannel(this.account.address, createReceiver, createAmount, createDays).then(result => {
      //Check if transaction has been mined and executed succesfuly
      if (result.receipt.status == 1) {
        this.setStatus('Transaction complete!', 'create');
        this.web3Service.updateBalance(this.account);

        //Create new notification to notify this action
        let objects = 'accounts/' + JSON.stringify(this.account);
        let not = new notification('Operation', 'Create channel succesfully executed at ' + this.account.address, 'success', objects)
        this.notificationsService.addNotificationsSource(not);

        //Navigate back to accounts
        this.web3Service.sleep(1000).then(() => this.router.navigate(['../../'], {relativeTo: this.route}));
      }
      //Check if transaction has been mined but not executed succesfuly due to a EVM state revert events
      else if (result.receipt.status == 0)
        this.setStatus('Error creating channel, EVM state reverted', 'create');
    }).catch(error => {
      console.log("Error creating the channel: " + error);
    });

  }

  //Update channel form submit
  updateChannel() {
    //As above but changing the status and fields

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

    //Check if any conditional transaction exists within the update
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

    //Correct direction and amount values
    if(sender.toString().toLowerCase() == this.channel.farEnd.toString().toLowerCase()) {
      amount = this.channel.farEndValue - send;
      for(let i=0; i< dirs.length; i++) 
        dirs[i] = ((dirs[i] == 0) ? 1 : 0);   
    }
    else if(sender.toString().toLowerCase() == this.channel.nearEnd.toString().toLowerCase()) 
      amount = this.channel.nearEndValue - send;
  
    if(amount > 0) {

      //Create a new update parameters according to the form
      let params = new updateParams(this.web3Service.web3, sender, chann, amount, id, signature, rs, ttls, rhvals, dirs);

      //Update the state of a channel in the blockchain using web3service and update parameters. Async, promise
      this.web3Service.updateState(this.channel.address, this.account.address, params).then(result => {
        //As in createChannel()
        if (result.receipt.status == 1) {
          this.paramToChann(this.channel, params);
          this.web3Service.updateBalance(this.account);
          this.setStatus('Transaction complete!', 'update');

          let objects = 'accounts/' + JSON.stringify(this.account) + '/channels/' + JSON.stringify(this.channel);
          let not = new notification('Operation', 'Update state transaction succesfully executed ' + this.channel.address + ' at ' + this.account.address, 'success', objects)
          this.notificationsService.addNotificationsSource(not);

          this.web3Service.sleep(1000).then(() => this.router.navigate(['../../'], { relativeTo: this.route }))
        }
        else if (result.receipt.status == 0)
          this.setStatus('Error updating channel, EVM state reverted', 'update');
      }).catch(error => {
        console.log("Error updating the channel: " + error);
      });
    }

  }

  //Analog to update state just changing the blockchain function called to dispute state
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
          this.paramToChann(this.channel, params);
          this.web3Service.updateBalance(this.account);
          this.setStatus('Transaction complete!', 'dispute');

          let objects = 'accounts/' + JSON.stringify(this.account) + '/channels/' + JSON.stringify(this.channel);
          let not = new notification('Operation', 'Dispute state transaction succesfully executed ' + this.channel.address + ' at ' + this.account.address, 'success', objects)
          this.notificationsService.addNotificationsSource(not);

          this.web3Service.sleep(1000).then(() => this.router.navigate(['../../'], { relativeTo: this.route }))
        }
        else if (result.receipt.status == 0)
          this.setStatus('Error disputing state, EVM state reverted', 'dispute');
      }).catch(error => {
        console.log("Error disputing state: " + error);
      });
    }

  }

  //updates the channel according to an update parameters
  paramToChann(channel: channel, param: any) {
    channel.hashes = param.hs;
    channel.randoms = param.rs;
    channel.ttls = param.ttls;
    channel.direction = param.ends;
    channel.rhvals = param.rhVals;
  }

  //Set status depending on the operation
  setStatus(message: string, operation: string) {
    if(operation == 'create')
      this.status_create = message;
    else if(operation = 'update')
      this.status_update = message;
    else if(operation = 'dispute')
      this.status_dispute = message;
  }

  //Navigate back 
  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  //Enough ether validator
  enoughEther(amount: string): boolean {
    //Check if amount canBeNumber
    if (!canBeNumber(amount))
      return false;

    //Check if value is possitive, less than 100 Ether and the account has enough balance to handle the operation
    if (+amount < 0 || +amount > 100 || +amount > +this.account.balance)
      return false;

    return true;
  }

  //Enough channel ether validator, similar to enough ether validator
  enoughEtherChannel(amount: string): boolean {
    if (!canBeNumber(amount))
      return false;

    let myValue = 0;

    //Check if the sender is the near end or the far end to adapt the value
    if (this.account.address.toLowerCase() == this.channel.farEnd.toLowerCase())
      myValue = this.channel.nearEndValue;
    else if (this.account.address.toLowerCase() == this.channel.nearEnd.toLowerCase())
      myValue = this.channel.farEndValue;

    if (+amount < 0 || +amount > 100 || +amount > myValue)
      return false;

    return true;
  }

  //Can be bytes32 validator, number with length 66
  canBeBytes32(randoms:string): boolean {
    let rands = randoms.split(';');

    for(let rand of rands) 
      if(!canBeNumber(rand)  || rand.length != 66)
        return false;

    return true;
  }

  //Can be number validator for multiple values 
  canBeNumbers(numbers: string): boolean {
    let num = numbers.split(';');

    for (let n of num)
      if (!canBeNumber(n))
        return false;

    return true;
  }



}
