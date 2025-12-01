import { Component, inject, OnInit,ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from "../../api/api.service";
import { AuthService } from "../../auth/auth.service";
import { DataService } from "../../user/data.service";

import { RouterLink, ActivatedRoute, Router} from '@angular/router';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

import { QuickNavService } from '../../reuseables/services/quick-nav.service';
import { CurrencyConverterPipe } from '../../reuseables/pipes/currency-converter.pipe';
import { SpinnerComponent } from '../../reuseables/http-loader/spinner.component';


@Component({
  selector: 'app-team-details',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CurrencyConverterPipe,
    SpinnerComponent,
  ],
  templateUrl: './team-details.component.html',
  styleUrl: './team-details.component.css'
})

export class TeamDetailsComponent implements OnInit{

  constructor(
    private route: ActivatedRoute,
  ) {}

  quickNav = inject(QuickNavService)
  history = window.history
  directory:any
  commType:any

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const level = params.get('level');
      this.commType = params.get('comm');

      this.directory=`${level}`
      if (!this.quickNav.storeData.get('promotionLevel_'+level)) {
          this.quickNav.reqServerData.get(`teams/?level=${level}&comm_type=${this.commType}`).subscribe({
            next: (response) =>{
              console.log({response});
              this.users=this.quickNav.storeData.get('promotionLevel_'+level)
            },
          });
        }else{
          this.users= this.quickNav.storeData.get('promotionLevel_'+level)
        }

    })
  }

  users : any
  // [] = []

  pageSize = 10;
  currentPage = 1;

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    let res =  this.users.slice(start, start + this.pageSize);

    console.log({res});

    return res

  }

  get totalPages() {
    return Math.ceil(this.users.length / this.pageSize);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

}
