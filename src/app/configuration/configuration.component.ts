import { Component, OnInit } from '@angular/core';
import { NedbService } from '../nedb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  disabled: boolean;

  constructor(private nedbService:NedbService, public router:Router) { this.disabled = false; }

  ngOnInit() {
  }

  //Drop dbs
  dropDBs() {
    this.nedbService.dropDBs();
    this.disabled = true;
  }

  navigateRoot(){
    this.router.navigate(['']);
  }

}
