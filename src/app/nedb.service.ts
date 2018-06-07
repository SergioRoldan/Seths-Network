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

  constructor(private notificationsService: NotificationsService) { this.loadDbs(); }

  ngOnInit() {}

  loadDbs() {
    this.db = {};
    //Instanciate dbs
    this.db.accounts = new Datastore({ filename: 'accounts.db', inMemoryOnly: false, autoload: true });
    this.db.channels = new Datastore({ filename: 'channels.db', inMemoryOnly: false, autoload: true });

    /* Erase the db, just for development purposes
      this.db.accounts.remove({}, { multi: true }, function (err, numRemoved) {
        this.db.accounts.loadDatabase(function (err) {});
      });
      this.db.channels.remove({}, { multi: true }, function (err, numRemoved) {
        this.db.channels.loadDatabase(function (err) {});
      });
    */

    //Force the prune of old files
    this.db.accounts.persistence.compactDatafile();
    this.db.channels.persistence.compactDatafile();

    //Force accounts not to be duplicated
    this.db.accounts.ensureIndex({ fieldName: 'address', unique: true }, (err) => {
      if(err){
        let e = new error('NeDBService', 'Error unique id violated' + err, 'danger');
        this.notificationsService.addErrorSource(e);
      }
    });

  }

  async getAccount(address): Promise<any> {
    //Return acounts as a promise in async function
    try {
      //Await to findOne function to resolve
      let res = await this.findOne(this.db.accounts, { "address": address });
      if(!res || res == null)
        throw("Not found: account");
      
      let acc = new account();
      //Map object to class
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
    //Return channel as a promise in async function
    try {
      //Await findOne function to resolve
      let res:any = await this.findOne(this.db.channels, { "channel.address": address });
      if (!res || res == null)
        throw ("Not found: channel");
      
      let chann = new channel();
      //Map object to class
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
    //Return channels as a promise in async function
    try {
      let channs = [];
      //Await findAll promise to resolve
      let res:any = await this.findAll(this.db.channels, { "account": account });
      if (!res || res == null )
        throw ("Not found: channels");

      for(let r of res as Array<any>) {
        let chann = new channel();
        //Map object to class
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
    //Return accounts as a promise in async function
    try {
      let accs = [];
      //Await findAll promise to resolve
      let res = await this.findAll(this.db.accounts, {});
      if (!res || res == null)
        throw ("Not found: accounts");

      for(let r of res as Array<any>) {
        let acc = new account();
        //Map object to class
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

    });
  }

  insertChannel(account, channel: channel) {
    this.db.channels.insert({ account: account, channel: channel }, (err, newDoc) => {
      if (err) {
        let e = new error('NeDBService', 'Error inserting channel' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

    });
  }

  deleteAccount(address) {
    //Define match filter
    this.db.accounts.remove({ "address": address }, (err, numRemoved) => {
      if (err) {
        let e = new error('NeDBService', 'Error removing account' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

    });
  }

  deleteChannel(address) {
    //Define match filter
    this.db.channels.remove({ "channel.address": address }, (err, numRemoved) => {
      if (err) {
        let e = new error('NeDBService', 'Error removing channel' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

    });
  }

  updateChannel(account, channel: channel, upsert?) {
    //Define match filter and update parameters
    this.db.channels.update({ "channel.address": channel.address, "account": account }, { account: account, channel: channel }, upsert || {}, (err, numReplaced) => {
      if (err) {
        let e = new error('NeDBService', 'Error updating channel' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

    });
  }

  updateAccount(account: account, upsert?) {
    //Define match filter and update parameters
    this.db.accounts.update({ "address": account.address }, account, upsert || {}, (err, numReplaced) => {
      if (err) {
        let e = new error('NeDBService', 'Error updating account' + err, 'danger');
        this.notificationsService.addErrorSource(e);
        return;
      }

    });
  }

  //Define finds as promises not callbacks, default by NeDB without direct support for promises. To chain promises purposes

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
