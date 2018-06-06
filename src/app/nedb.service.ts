import { Injectable, OnInit } from '@angular/core';
import { channel } from '../util/channel';
import { account } from '../util/account';
import { error } from '../util/error';
import { NotificationsService } from './notifications.service';
var Datastore = require('nedb');


@Injectable({
  providedIn: 'root'
})
export class NedbService implements OnInit {

  db: any;

  constructor(private notificationsService: NotificationsService) { 

    this.loadDbs();

  }

  ngOnInit() {}

  loadDbs() {
    this.db = {};
    this.db.accounts = new Datastore({ filename: 'accounts.db', inMemoryOnly: false, autoload: true });
    this.db.channels = new Datastore({ filename: 'channels.db', inMemoryOnly: false, autoload: true });

    this.db.accounts.persistence.compactDatafile();
    this.db.channels.persistence.compactDatafile();

    this.db.accounts.ensureIndex({ fieldName: 'address', unique: true }, (err) => {
      if(err){
        let e = new error('NeDBService', 'Error unique id violated' + err, 'danger');
        this.notificationsService.addErrorSource(e);
      }
    });
    /*this.db.channels.ensureIndex({ fieldName: 'channel.address', unique: true }, (err) => {
      if(err)
        console.log("Unique violated by one or more objects in db: ", err);
    });*/

  }


  async getAccount(address): Promise<any> {
    try {
      let res = await this.findOne(this.db.accounts, { "address": address });
      if(!res || res == null)
        throw("Not found: account");
      
      let acc = new account();
      acc.map(res);

      return new Promise((resolve, reject) => {
      
        if(!acc || !acc.address)
          reject("Error retrieving object account");

        resolve(acc);
      });
    } catch(e) {
      throw(e);
    }
    
  }

  async getChannel(address): Promise<any> {
    try {
      let res:any = await this.findOne(this.db.channels, { "channel.address": address });
      if (!res || res == null)
        throw ("Not found: channel");
      
      let chann = new channel();
      chann.map(res.channel);

      return new Promise((resolve, reject) => {
        if (!chann)
          reject("Error retrieving object channel");

        resolve(chann);
      });
    } catch (error) {
      throw(error);
    }
  }

  async getChannels(account): Promise<any> {
    try {
      let channs = [];
      let res:any = await this.findAll(this.db.channels, { "account": account });
      if (!res || res == null )
        throw ("Not found: channels");

      for(let r of res as Array<any>) {
        let chann = new channel();
        chann.map(r.channel);
        channs.push(chann);
      }
      
      if(channs.length == 0)
        throw("Not found: channels");

      return new Promise((resolve, reject) => {
        if (!channs)
          reject("Error retrieving object channels");

        resolve(channs);
      });
    } catch (error) {
      throw(error);
    }
  }

  async getAccounts(): Promise<any> {
    try {
      let accs = [];
      let res = await this.findAll(this.db.accounts, {});
      if (!res || res == null)
        throw ("Not found: accounts");

      for(let r of res as Array<any>) {
        let acc = new account();
        acc.map(r);
        accs.push(acc);
      }

      if(accs.length == 0)
        throw("Not found: accounts");

      return new Promise((resolve, reject) => {
        if(!accs)
          reject("Error retrieving object accounts");

        resolve(accs);
      });
    } catch(e) {
      throw(e);
    }
  }

  insertAccount(account: account) {
    this.db.accounts.insert(account, (err, newDoc) => {
      if (err) {
        let e = new error('NeDBService', 'Error inserting account' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //console.log("Insert Account: ", newDoc);
    });
  }

  insertChannel(account, channel: channel) {
    this.db.channels.insert({ account: account, channel: channel }, (err, newDoc) => {
      if (err) {
        let e = new error('NeDBService', 'Error inserting channel' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //console.log("Insert Channel: ", newDoc);
    });
  }

  deleteAccount(address) {
    this.db.accounts.remove({ "address": address }, (err, numRemoved) => {
      if (err) {
        let e = new error('NeDBService', 'Error removing account' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //console.log("NumRemoved Account: ", numRemoved);
    });
  }

  deleteChannel(address) {
    this.db.channels.remove({ "channel.address": address }, (err, numRemoved) => {
      if (err) {
        let e = new error('NeDBService', 'Error removing channel' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //console.log("NumRemoved Channel: ", numRemoved);
    });
  }

  updateChannel(account, channel: channel, upsert?) {
    this.db.channels.update({ "channel.address": channel.address, "account": account }, { account: account, channel: channel }, upsert || {}, (err, numReplaced) => {
      if (err) {
        let e = new error('NeDBService', 'Error updating channel' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //console.log("NumReplaced Channel: ", numReplaced);
    });
  }

  updateAccount(account: account, upsert?) {
    this.db.accounts.update({ "address": account.address }, account, upsert || {}, (err, numReplaced) => {
      if (err) {
        let e = new error('NeDBService', 'Error updating account' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

      //console.log("NumReplaced Account: ", numReplaced);
    });
  }

  //Define finds as promises not callbacks

  findOne(db, query): Promise<any> {
    return new Promise((resolve, reject) => {
      db.findOne(query, (err, doc) => {
        if(err) 
          reject(err);

        resolve(doc);
      });
    }); 
  }

  findAll(db, query): Promise<any> {
    return new Promise((resolve, reject) => {
      db.find(query, (err, docs) => {
        if (err) 
          reject(err);

        resolve(docs);
      });
    }); 
  }

}
