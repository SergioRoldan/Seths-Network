import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { error } from '../util/error';
import { notification } from '../util/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService implements OnInit{

  errors: error[] = [];
  notifications: notification[] = [];
  total: number = 0;

  private errorsSource = new BehaviorSubject<error[]>(this.errors);
  private notificationsSource = new BehaviorSubject<notification[]>(this.notifications);
  private totalSource = new BehaviorSubject<number>(this.total);

  errors$ = this.errorsSource.asObservable();
  notifications$ = this.notificationsSource.asObservable();
  total$ = this.totalSource.asObservable();

  constructor() {}

  ngOnInit() {}

  addErrorSource(error: error) {
    this.errors.push(error);
    this.addTotalSource();
    this.errorsSource.next(this.errors);
  }

  addNotificationsSource(notification: notification) {
    this.notifications.push(notification);
    this.addTotalSource();
    this.notificationsSource.next(this.notifications);
  }

  addTotalSource() {
    this.total++;
    this.totalSource.next(this.total);
  }

  removeErrorSource(errors: error[]) {
    for(let e of errors)
      if(this.errors.includes(e)) {
        this.errors.splice(this.errors.indexOf(e),1);
        this.removeTotalSource();
      }
    
    this.errorsSource.next(this.errors);
  }

  removeNotificationsSource(notifications: notification[]) {
    for(let n of notifications)
      if(this.notifications.includes(n)) {
        this.notifications.splice(this.notifications.indexOf(n), 1);
        this.removeTotalSource();
      }

    this.notificationsSource.next(this.notifications);
  }

  removeTotalSource() {
    this.total--;
    this.totalSource.next(this.total);
  }

}
