import { Injectable, OnInit } from '@angular/core';
var Datastore = require('nedb');

@Injectable({
  providedIn: 'root'
})
export class NedbService implements OnInit {

  db: any;

  constructor() { 
    db = new Datastore({filename: '../../db', autoload:true});
  }

  ngOnInit() {

  }
}
