import { Component, Output, inject, Inject, AfterViewInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { ApiService } from "../api/api.service";
import { Router , RouterLink} from '@angular/router';

import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";

import { loadExternalScript, quickMessage } from "../../helper";
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FormBuilder, Validators } from '@angular/forms';

import { QuickNavService } from '../reuseables/services/quick-nav.service';
import { AuthService } from "../reuseables/auth/auth.service";
import { SpinnerComponent } from '../reuseables/http-loader/spinner.component';


@Component({
  selector: 'app-authentication',
  imports: [ReactiveFormsModule,RouterLink,CommonModule,FormsModule,SpinnerComponent],
  templateUrl: './register.component.html',
  styleUrl: './authentication.component.css'
})

export class RegisterComponent {

  constructor(
    // private route: ActivatedRoute,
    // private router: Router
    private pop: quickMessage,
    private dialog: MatDialog
  ) {}

  @ViewChild('selectCurrency') selectCurrency!: ElementRef<HTMLInputElement>;


  apiService = inject(ApiService);
  authService = inject(AuthService);
  router = inject(Router);
  helpLink=''
  history = window.history

  loading = false
  favoriteFramework = '';
  invitedBy!:any

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  MyForm = new FormGroup({
    username: new FormControl(''),
    // otp: new FormControl(''),
    fullname: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl(''),
    // currency: new FormControl(''),
    RefCode:new FormControl('')
  });

  currencySettings :any [ ] = [ ]

  ngOnInit():void{
    this.authService.setRefCode()
  }

  ngAfterViewInit() {
    loadExternalScript()
  }

  otpCode = '';
  countdown = 0;
  resending = false
  private intervalId: any;

  startCountdown(): void {
    this.countdown = 30;
    clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  resendOtp(): void {
    let data = this.MyForm.value

    if (!data.email) {
      this.pop.show('Please provide a valid email address')
      setTimeout(() => {
        this.resending=false
      }, 2000);

      return
    }

    this.otpCode = '';
    this.startCountdown();

    // this.handleSubmit('register/?action=send_verification_code&email='+data.email,'get')

  }

  trackById(index: number, item: any) {
    return item.id;
  }
  navigate(url:any) {
    url = url.split(' ')
    this.router.navigate(url);
  }


}
