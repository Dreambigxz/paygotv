import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CurrencyConverterPipe } from '../reuseables/pipes/currency-converter.pipe';
import { SpinnerComponent } from '../reuseables/http-loader/spinner.component';
import { StoreDataService } from '../reuseables/http-loader/store-data.service';
import { RequestDataService } from '../reuseables/http-loader/request-data.service';
import { Header2Component } from "../components/header2/header2.component";

@Component({
  selector: 'app-invite-reward',
  imports: [
    CommonModule,
    SpinnerComponent,
    Header2Component,
    CurrencyConverterPipe
  ],
  templateUrl: './invite-reward.component.html',
  styleUrl: './invite-reward.component.css'
})
export class InviteRewardComponent {

  storeData = inject(StoreDataService)
  reqServerData = inject(RequestDataService)


  ngOnInit(){
      this.storeData.store['pageDetails']='promotions'
      if (!this.storeData.get('invite-rewards')) {this.reqServerData.get("rewards?showSpinner").subscribe()}
  }

}
