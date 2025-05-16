import { Component } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

   notifications: Notification[] = [];

  constructor( private notificationService: NotificationService ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe(data => {
      this.notifications = data;
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'profileView':
        return 'eye-outline';
      case 'eventNearby':
        return 'location-outline';
      case 'metricRated':
        return 'star-outline';
      default:
        return 'notifications-outline';
    }
  }

}



