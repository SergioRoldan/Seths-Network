import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { error } from '../util/error';
import { notification } from '../util/notification';

//Where the service is injected
@Injectable({
  providedIn: 'root'
})
export class NotificationsService implements OnInit{

  errors: error[] = [];
  notifications: notification[] = [];
  total: number = 0;

  //Define behavior subjects and observables
  private errorsSource = new BehaviorSubject<error[]>(this.errors);
  private notificationsSource = new BehaviorSubject<notification[]>(this.notifications);
  private totalSource = new BehaviorSubject<number>(this.total);
  errors$ = this.errorsSource.asObservable();
  notifications$ = this.notificationsSource.asObservable();
  total$ = this.totalSource.asObservable();

  constructor() {}

  ngOnInit() {}

  //Add and remove object/s to the error and notifications source to fire a new event in the observables

  //Add a single error
  addErrorSource(error: error) {
    this.errors.push(error);
    this.addTotalSource();
    this.errorsSource.next(this.errors);
  }

  //Add a single notification
  addNotificationsSource(notification: notification) {
    this.notifications.push(notification);
    this.addTotalSource();
    this.notificationsSource.next(this.notifications);
  }

  //Increase number of notifications by one
  addTotalSource() {
    this.total++;
    this.totalSource.next(this.total);
  }

  //Remove errors
  removeErrorSource(errors: error[]) {
    const errs = Array.from(errors);  
    
    for(let i=0; i < errs.length; i++) {
      if(this.errors.includes(errs[i])) {
        this.errors.splice(this.errors.indexOf(errs[i]),1);
        this.removeTotalSource();
      }
    }
    
    this.errorsSource.next(this.errors);
  }

  //Remove notifications
  removeNotificationsSource(notifications: notification[]) {
    const notfs = Array.from(notifications);

    for(let i=0; i < notfs.length; i++) {
      if(this.notifications.includes(notfs[i])) {
        this.notifications.splice(this.notifications.indexOf(notfs[i]), 1);
        this.removeTotalSource();
      }
    }

    this.notificationsSource.next(this.notifications);
  }

  //Decrease number of notifications by one
  removeTotalSource() {
    this.total--;
    this.totalSource.next(this.total);
  }

}
