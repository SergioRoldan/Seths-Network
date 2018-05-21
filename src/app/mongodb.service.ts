import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MongodbService {

  constructor() { }

}

/*var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27041');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected!");
})*/