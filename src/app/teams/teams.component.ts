import { Component, inject, OnInit,ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { DataService } from "../user/data.service";

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { RouterLink, ActivatedRoute, Router} from '@angular/router';

import { QuickNavService } from '../reuseables/services/quick-nav.service';
import { RequestDataService } from '../reuseables/http-loader/request-data.service';

import { SpinnerComponent } from '../reuseables/http-loader/spinner.component';
import { Header2Component } from '../components/header2/header2.component';
import { CurrencyConverterPipe } from '../reuseables/pipes/currency-converter.pipe';
import { MenuBottomComponent } from "../components/menu-bottom/menu-bottom.component";


@Component({
  selector: 'app-teams',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    RouterLink,
    SpinnerComponent,
    Header2Component,
    CurrencyConverterPipe,
    MenuBottomComponent
  ],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css'
})

export class TeamsComponent {

  current = 'teams';
  quickNav = inject(QuickNavService)

  copied = false

  pendingSurb = 0

  refLink:any
  activeTab: string = "referral";


  makeRefLink() {
    const RefCode = this.quickNav.storeData.get('refDir')['RefCode'];
      this.refLink = `${window.location.origin}/register?uplinner=${RefCode}`;

    // this.setLevelCard()
  }


  copyContent() {
    navigator.clipboard.writeText(this.refLink).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 3000);
    });
  }


  ngOnInit(){
      if (!this.quickNav.storeData.get('refDir')) {this.quickNav.reqServerData.get("teams/").subscribe(
        (res)=>{

          console.log({res});

          this.makeRefLink()
        }
      )}
    else{
      this.makeRefLink()
    }
  }


  openLevelDetails(comm_type:any,level:any){
    this.quickNav.go(`/team-detail/${level}/${comm_type}`);
  }


}
