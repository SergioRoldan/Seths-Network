import { Component, OnInit } from '@angular/core';

import { Web3Service } from '../web3.service';
import { account } from '../../util/account';
import { Router } from '@angular/router';
import { FilterPipe } from '../../util/filter.pipe';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  accounts: account[] = [];

  searchString: string;

  selectedAccount: any = null;

  constructor(private web3Service: Web3Service, public router:Router) { }

  ngOnInit() {
    this.updateAccounts();
  }

  selectAccount(account) {
    this.selectedAccount = account;
    this.router.navigate(['/accounts', JSON.stringify(account)]);
  }

  updateAccounts() {
    this.web3Service.accounts$.subscribe(accounts => this.accounts = accounts);
  }

}
