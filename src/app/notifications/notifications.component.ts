import { Component, OnInit } from '@angular/core';
import { error } from '../../util/error';
import { notification } from '../../util/notification';
import { Router } from '@angular/router';
import { NotificationsService } from '../notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  errors: error[];
  notifications: notification[];

  selectedErrors: error[] = [];
  selectedNotifications: notification[] = [];

  constructor(public router: Router, private notificationsService: NotificationsService) { }

  ngOnInit() {
    this.notificationsService.errors$.subscribe(errors => {
      this.errors = errors;
    });
    this.notificationsService.notifications$.subscribe(notifications => this.notifications = notifications);
  }

  goBack() {
    this.router.navigate(['']);
  }

  selectNotification(notification:notification) {
    if(this.selectedNotifications.includes(notification))
      this.selectedNotifications.splice(this.selectedNotifications.indexOf(notification), 1);
    else
      this.selectedNotifications.push(notification);
  }

  selectError(error:error) {
    if(this.selectedErrors.includes(error))
      this.selectedErrors.splice(this.selectedErrors.indexOf(error), 1);
    else 
      this.selectedErrors.push(error);
  }

  selectErrors() {
    if(this.selectedErrors.length != this.errors.length)
      this.selectedErrors = this.errors;
    else  
      this.selectedErrors = [];
  }

  deleteErrors() {
    this.notificationsService.removeErrorSource(this.selectedErrors);
    this.selectedErrors = [];
  }

  selectNotifications() {
    if(this.selectedNotifications.length != this.notifications.length)
      this.selectedNotifications = this.notifications;
    else 
      this.selectedNotifications = [];
  }

  deleteNotifications() {
    this.notificationsService.removeNotificationsSource(this.selectedNotifications);
    this.selectedNotifications = [];
  }

  selectAll() {
    if(this.selectedNotifications.length == this.notifications.length && this.selectedErrors.length == this.errors.length) {
      this.selectedErrors = [];
      this.selectedNotifications = []
    } else {
      this.selectedErrors = this.errors;
      this.selectedNotifications = this.notifications;
    }
  }

  deleteAll() {
    this.selectAll();
    this.deleteAllSelected();
  }

  deleteAllSelected() {
    this.notificationsService.removeErrorSource(this.selectedErrors);
    this.notificationsService.removeNotificationsSource(this.selectedNotifications);
    this.selectedErrors = [];
    this.selectedNotifications = [];
  }

  goNotificator(notification:notification) {
    if(notification.objects != null) {
      this.notificationsService.removeNotificationsSource([notification]);
      this.router.navigate([notification.objects]);
    } else {
      alert("Unable to redirect you to the source of this notification")
    }
    
  }

}
