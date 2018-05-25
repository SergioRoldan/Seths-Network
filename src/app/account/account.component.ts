import { Component, OnInit, OnDestroy } from '@angular/core';
import { account } from '../../util/account';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from '../web3.service';
import { channel } from '../../util/channel';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy {

  account: account;

  private sub: any;

  constructor(private route: ActivatedRoute, public router: Router, private web3Service: Web3Service) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.account = JSON.parse(params['account']);
      this.web3Service.accounts$.subscribe(accounts => {
        for(let acc of accounts) 
          if(acc.address == this.account.address)
            this.account = acc;
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  navigateRoot() {
    this.router.navigate(['']);
  }

}
