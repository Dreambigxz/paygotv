import { Component, inject } from '@angular/core';
import { App } from '@capacitor/app';
import {CommonModule} from '@angular/common';
import { RouterLink, RouterOutlet, Router, NavigationEnd,NavigationStart } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // ✅ Import this

import { DownloadAppComponent } from "./download-app/download-app.component";
import { MatDialog } from '@angular/material/dialog';

import PullToRefresh from 'pulltorefreshjs';
// import { Router, NavigationEnd,NavigationStart, RouterOutlet } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { AuthService } from './reuseables/auth/auth.service';


@Component({
  selector: 'app-root',
  standalone:true,
 imports: [ RouterOutlet, RouterLink, HttpClientModule],
   templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

export class AppComponent {

  // constructor(
  //   public dialog: MatDialog,
  // ) {}

  title = 'paygotv - Investment App';
  appVersion:any

  authService = inject(AuthService)



  constructor(private router: Router) {


    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        // Find the last navigation event to check trigger type
        const nav = this.router.getCurrentNavigation();
        const segments = window.location.pathname.split('/');
        const activePage = segments.pop() || '';

        if (nav?.trigger !== 'popstate') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (["login","register","reset"].includes(activePage)&&this.authService.checkLogin()) {
          this.authService.router.navigate(['/']); // or '/dashboard'
        }

        // this.appManager.showDownload();
        // loadExternalScript()
        //
        // let total_read = this.quickNav.storeData.get('total_read')
        //
        // if (this.quickNav.storeData.get('total_read')) {
        //   this.quickNav.reqServerData.post('notifications/?hideSpinner', {total_read:this.quickNav.storeData.get('total_read'),processor:'save_read'}).subscribe()
        // }

      });


  }


  checkAppVersion(version:any){
    // App.getInfo().then(info => {
    //   this.appVersion=info.version
    //   console.log('App Version:', info.version);
    //   console.log('App Name:', info.name);
    //   console.log('Build Version:', info.build);
    //   if (version.version>info.version) {
    //     let dialogRef = this.dialog.open(DownloadAppComponent,{
    //       data:{'url':version.url}
    //     })
    //     dialogRef.afterClosed().subscribe(result => {
    //       if (result) {
    //           if (typeof(result)==='string') {}
    //         }
    //       })
    //   }
    //
    // });
  }

  ngOnInit(): void {

    App.getInfo().then(info => {

      PullToRefresh.init({
        mainElement: 'body',
        onRefresh: () => {
          // Your refresh logic here
          return new Promise((resolve) => {
            // console.log('Pull-to-refresh triggered');
            // simulate async refresh
            setTimeout(() => {
              window.location.reload(); // or any refresh logic
              resolve(true);
            }, 1000);
          });
        }
      });
    });



  }

  ngOnDestroy(): void {
    PullToRefresh.destroyAll(); // Clean up when component is destroyed

    // console.log(window.location.href);

  }
}
