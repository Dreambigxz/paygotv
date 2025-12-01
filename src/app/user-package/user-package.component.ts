import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { Header2Component } from '../components/header2/header2.component';
import { SpinnerComponent } from '../reuseables/http-loader/spinner.component';
import { QuickNavService } from '../reuseables/services/quick-nav.service';
import { CountdownPipe } from '../reuseables/pipes/countdown.pipe';
import { MenuBottomComponent } from "../components/menu-bottom/menu-bottom.component";


@Component({
  selector: 'app-user-package',
  imports: [
    CommonModule,
    Header2Component,
    SpinnerComponent,
    CountdownPipe,
    MenuBottomComponent
  ],
  templateUrl: './user-package.component.html',
  styleUrl: './user-package.component.css'
})
export class UserPackageComponent {

  quickNav = inject(QuickNavService)

  activeTab: 'active' | 'completed' = 'active';
  expandedId: number | null = null;

  investments: any  //= [ ]

  ngOnInit(){

    if (!this.quickNav.storeData.get('packages')) {
      this.quickNav.reqServerData.get('my-investment/').subscribe((res)=>{
        console.log(this.quickNav.storeData.get('packages'));
        this.investments=this.quickNav.storeData.get('packages')
      })
    }else{
      this.investments=this.quickNav.storeData.get('packages')
    }
  }

  get activeList() {
    const activePackage =  this.investments?.filter((i:any) => i.status === 'active');
    if (activePackage&&!this.expandedId&&activePackage[0]) {
      this.expandedId=activePackage[0].id
    }

    console.log({activePackage});

    return activePackage
  }

  get completedList() {
    // return this.investments?.filter((i:any) => i.status === 'completed');
    const data =  this.investments?.filter((i:any) => i.status === 'completed');
    return data
  }

  get totalActiveAmount() {
    return this.activeList?.reduce((sum:any, i:any) => sum + i.data.invest, 0);
  }

  get totalCompletedAmount() {
    return this.completedList?.reduce((sum:any, i:any) => sum + i.data.total, 0);
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  daysLeft(inv: any): number {
    const end = new Date(inv.ending_at);
    // end.setDate(end.getDate() + inv.data.cycle );

    const diff = end.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  earnedSoFar(inv: any): number {
    // !inv.data.cycle?inv.data.cycle=inv.data.cycleDays:0;
    const daysCompleted = inv.data.cycleDays  - this.daysLeft(inv);
    return daysCompleted * inv.data.daily;
  }

}
