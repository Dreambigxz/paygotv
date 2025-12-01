import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';


import { StoreDataService } from '../http-loader/store-data.service'; // ✅ adjust path as needed
import { FormHandlerService } from '../http-loader/form-handler.service';
import { ConfirmationDialogService } from '../modals/confirmation-dialog/confirmation-dialog.service';
import { RequestDataService } from '../http-loader/request-data.service';
import { ToastService } from '../toast/toast.service';
import { AuthService } from '../auth/auth.service';

import { copyContent } from '../helper';


@Injectable({
  providedIn: 'root'
})
export class QuickNavService {
  constructor(private router: Router) {}

  /**
   * Navigate quickly to any route.
   * @param url - Route path or full URL.
   * @param extras - Optional router navigation extras.
   */

   storeData = inject(StoreDataService)
   reqServerData = inject(RequestDataService)
   authService=inject(AuthService)
   toast=inject(ToastService)

   emptyDataUrl = 'assets/images/empty-box.png'


  go(url: string, queryParams?: any): void {
   this.router.navigate([url], { queryParams });
  }

  alert(message:any,status:string='success'){
    this.toast.show({message,status})
  }

  copy(item:any){
    copyContent(this.toast,item)
  }

  openTab(url:any){
    window.open(url, '_blank')
  }
}
