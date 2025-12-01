import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RequestDataService } from './request-data.service';
import { ToastService } from '../toast/toast.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FormHandlerService {
  private api = inject(RequestDataService);
  private toast = inject(ToastService);

  submitForm(form: FormGroup,processor:any,endpoint: string, showToast=true, callback?: (res: any) => void): void {
    if (form.valid) {
      const data = form.value
      data['processor']=processor
      this.api.post(endpoint, data)
        .pipe(
          tap(res => {
            showToast?this.toast.show(res):0;
            callback?callback(res):0;
          }),
          catchError((err) => {
            // this.toast.show("Error timeout! please try again.")
            return of(null);
          })
        )
        .subscribe();
    } else {
      form.markAllAsTouched();
      showToast?this.toast.show({message:'Please fix form errors before submitting.', status:'error'}):0;
    }
  }
}
