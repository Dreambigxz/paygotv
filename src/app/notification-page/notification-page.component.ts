import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of} from 'rxjs';

import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { DataService } from "../user/data.service";

import { onScroll, loadMore } from '../../helper';

import { SpinnerComponent } from '../reuseables/http-loader/spinner.component';

import { CurrencyConverterPipe } from '../reuseables/pipes/currency-converter.pipe';
import { Header2Component } from "../components/header2/header2.component";
import { QuickNavService } from '../reuseables/services/quick-nav.service';
import { MomentAgoPipe } from '../reuseables/pipes/moment.pipe';


@Component({
  selector: 'app-notification-page',
  imports: [
    CommonModule,
    Header2Component,SpinnerComponent,
    MomentAgoPipe
  ],
  templateUrl: './notification-page.component.html',
  styleUrls: ['./notification-page.component.css']
})
export class NotificationPageComponent implements OnInit {

  serviceData = inject(DataService)
  apiService = inject(ApiService)
  authService = inject(AuthService)

  AllData=this.serviceData.userData;

  directory!:string

  loading=false
  isLoadingContent = false
  history = window.history

  notifications = (this.serviceData.userData as any).notification //any[] = [];
  ObjectiveList: { [key: string]: any } = {};
  totalNotUnread = (this.serviceData.userData as any).totalNotUnread

  quickNav = inject(QuickNavService)

  ngOnInit(): void {

    if (!this.quickNav.storeData.get('notifications')) {
      this.quickNav.reqServerData.get('notification/').subscribe((res)=>{

        console.log({res});
        this.notifications=res.main.notification

        this.notifications=[...res.main.notification.unseen, ...res.main.notification.seen]


        this.loadData.data=this.notifications
        loadMore(this.loadData)
        this.display=this.loadData.displayedItems

    })}

  }

  markAsRead(notification: any) {
    notification.unread = false;
    (this.serviceData.userData as any).totalNotUnread-=1

  }
  markAsUnRead(notification: any){notification.unread = true;}

  timeSince(dateStr: string): string {
    const date = new Date(dateStr);
    const seconds = Math.floor((+new Date() - +date) / 1000);

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (let key in intervals) {
      const interval = Math.floor(seconds / intervals[key]);
      if (interval >= 1) return `${interval} ${key}${interval > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  }

  display: any [] = []

  loadData  = {
    displayedItems:[],
    batchSize: 6,
    currentIndex : 0,
    data:this.notifications
  }


  onScroll(event: any) {

    this.loadData.data=this.notifications//&&this.notifications.unseen?[...this.notifications.unseen, ...this.notifications.seen]:this.notifications
    onScroll(event,this.loadData)
    this.display= this.loadData.displayedItems
    // console.log({'this.display':this.display});

  }

}
