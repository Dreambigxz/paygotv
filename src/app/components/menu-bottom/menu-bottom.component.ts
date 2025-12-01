import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router, RouterLink, NavigationEnd, RouterLinkActive} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  route: string;
  key: string;
  path: string;
}
@Component({
  selector: 'app-menu-bottom',
  imports: [
    CommonModule,
    RouterLink, RouterLinkActive,
    MatIconModule
  ],
  templateUrl: './menu-bottom.component.html',
  styleUrl: './menu-bottom.component.css'
})
export class MenuBottomComponent {

    router = inject(Router)
    items: NavItem[] = [
      { label: 'Main', route: '/', key: '', path:"M12 3l9 8h-3v7a1 1 0 0 1-1 1h-4v-5H11v5H7a1 1 0 0 1-1-1v-7H3l9-8z" },
      { label: 'Market', route: '/matches', key: 'matches', path:"M7 10h5v5H7zM3 5h1V3h2v2h10V3h2v2h1a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 8v11h18V8H3z" },
      { label: 'Trades', route: '/bethistory', key: 'bethistory', path:"M2 7v10a2 2 0 0 0 2 2h16V5H4a2 2 0 0 0-2 2zm6 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" },
      { label: 'Teams', route: '/promotions/earnings', key: 'earnings', path:"M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5C23 14.17 18.33 13 16 13z" },
      { label: 'Me', route: '/account', key: 'account', path:"M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" }
    ];

    activePage :any


    ngOnInit() {
      const segments = window.location.pathname.split('/');
      this.activePage = segments.pop() || '';
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          const segments = event.urlAfterRedirects.split('/');
          this.activePage = segments.pop() || ''; // 'earnings'
        }
      });

      console.log('activePage?', this.activePage);


    }


}
