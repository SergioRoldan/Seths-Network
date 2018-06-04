import { Injectable, OnInit } from '@angular/core';
import { channel } from '../util/channel';
import { account } from '../util/account';
var Datastore = require('nedb');


@Injectable({
  providedIn: 'root'
})
export class NedbService implements OnInit {

  db: any;

  constructor() { 

    console.log(">> Load");
    this.loadDbs();


    /* Delete me please
    console.log(">> Insert");
    this.insertDummy();
    console.log(">> Update");
    this.updateDummy();
    console.log(">> Delete");
    this.deleteDummy();
    */
  }

  ngOnInit() {}

  loadDbs() {
    this.db = {};
    this.db.accounts = new Datastore({ filename: 'accounts.db', inMemoryOnly: false, autoload: true });
    this.db.channels = new Datastore({ filename: 'channels.db', inMemoryOnly: false, autoload: true });

    this.db.accounts.ensureIndex({ fieldName: 'address', unique: true }, (err) => {
      if(err)
        console.log("Unique violated by one or more objects in db: ", err);
    });
    this.db.channels.ensureIndex({ fieldName: 'channel.address', unique: true }, (err) => {
      if(err)
        console.log("Unique violated by one or more objects in db: ", err);
    });

    // Delete me please
    this.getAccounts().then(val => {
      for(let v of val)
        console.log("Get Accounts: ", v, typeof(v));
    }).catch(e => {
      console.log("Get Accounts Error: ",e);
    });

    this.getChannels('0x0').then(val => {
      for (let v of val)
        console.log("Get Channels: ", v, typeof (v));
    }).catch(e => {
      console.log("Get Channels Error: ",e);
    });
    // Delete end

  }

  // Delete me plase
  insertDummy() {
    
    let chann = new channel('0x1','0x1','0x2','1','12','4','8');
    let acc = new account('0x4','0');

    this.insertAccount(acc);
    this.insertChannel('0x0', chann);

    this.getAccounts().then(val => {
      for (let v of val)
        console.log("Get Accounts: ", v, typeof (v));
    }).catch(e => {
      console.log("Get Accounts Error: ", e);
    });

    this.getChannels('0x0').then(val => {
      for (let v of val)
        console.log("Get Channels: ", v, typeof (v));
    }).catch(e => {
      console.log("Get Channels Error: ", e);
    });

  }

  //Delete me please
  deleteDummy() {
    this.deleteAccount('0x4');
    this.deleteChannel('0x1');

    this.getAccounts().then(val => {
      for (let v of val)
        console.log("Get Accounts: ", v, typeof (v));
    }).catch(e => {
      console.log("Get Accounts Error: ", e);
    });

    this.getChannels('0x0').then(val => {
      for (let v of val)
        console.log("Get Channels: ", v, typeof (v));
    }).catch(e => {
      console.log("Get Channels Error: ", e);
    });
  }

  //Delete me please
  updateDummy() {
    let chann = new channel('0x1', '0xa', '0xb', 'c', 'd', 'e', 'f');
    let acc = new account('0x4', '1000');

    this.updateAccount(acc);
    this.updateChannel('0x0', chann);

    this.getAccounts().then(val => {
      for (let v of val)
        console.log("Get Accounts: ", v, typeof (v));
    }).catch(e => {
      console.log("Get Accounts Error: ", e);
    });
  
    this.getChannels('0x0').then(val => {
      for (let v of val)
        console.log("Get Channels: ", v, typeof (v));
    }).catch(e => {
      console.log("Get Channels Error: ", e);
    });
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
        console.log("Error Insert Account ", err);
        return;
      }

      console.log("Insert Account: ", newDoc);
    });
  }

  insertChannel(account, channel: channel) {
    this.db.channels.insert({ account: account, channel: channel }, (err, newDoc) => {
      if (err) {
        console.log("Error Insert Channel ", err);
        return;
      }

      console.log("Insert Channel: ", newDoc);
    });
  }

  deleteAccount(address) {
    this.db.accounts.remove({ "address": address }, (err, numRemoved) => {
      if (err) {
        console.log("Error Remove Account ", err);
        return;
      }

      console.log("NumRemoved Account: ", numRemoved);
    });
  }

  deleteChannel(address) {
    this.db.channels.remove({ "channel.address": address }, (err, numRemoved) => {
      if (err) {
        console.log("Error Remove Channel ", err);
        return;
      }

      console.log("NumRemoved Channel: ", numRemoved);
    });
  }

  updateChannel(account, channel: channel, upsert?) {
    this.db.channels.update({ "channel.address": channel.address }, { account: account, channel: channel }, upsert || {}, (err, numReplaced) => {
      if (err) {
        console.log("Error Update Channel ", err);
        return;
      }

      console.log("NumReplaced Channel: ", numReplaced);
    });
  }

  updateAccount(account: account, upsert?) {
    this.db.accounts.update({ "address": account.address }, account, upsert || {}, (err, numReplaced) => {
      if (err) {
        console.log("Error Update Account ", err);
        return;
      }

      console.log("NumReplaced Account: ", numReplaced);
    });
  }

  //Define find as promise not callback

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
