import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { inject } from '@angular/core';

import { StoreDataService } from '../http-loader/store-data.service'; // ✅ adjust path as needed
import { FormHandlerService } from '../http-loader/form-handler.service';
import { ConfirmationDialogService } from '../modals/confirmation-dialog/confirmation-dialog.service';
import { RequestDataService } from '../http-loader/request-data.service';
import { ToastService } from '../toast/toast.service';

import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Router, NavigationEnd,NavigationStart, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';


import {  copyContent} from '../helper';

export type PaymentMethod = 'USD' | 'USDT' | 'TRON' | 'BANK';
export type PaymentMethodGrp = 'Local'|'Crypto'
type FormPageGroup = 'deposit'|'withdraw'

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  // Hold current payment method
  private paymentMethod$ = new BehaviorSubject<PaymentMethod>('USD');
  private storeData = inject(StoreDataService);
  private reqConfirmation = inject(ConfirmationDialogService);
  private reqServerData = inject(RequestDataService);

  fb = inject(FormBuilder);
  toast = inject(ToastService)

  private formHandler = inject(FormHandlerService);

  cryptoCoins = ["TRON", "USD", "USDT"]
  initCurrencies: any = []
  selectedCurrency:any
  minimumPayment=0
  page:any

  previewUrl: string | null = null;
  selectedFile: File | null = null;

  activeForm: 'Crypto' | 'Local' = 'Crypto'; // default

  SelectedCrypto : "USD" | "TRON" | "BANK" = "BANK"
  SelectedBank:any;

  selectedMode: PaymentMethod = 'BANK';
  methodView: Record<PaymentMethodGrp, any> = {
    'Crypto':{
      'form':this.fb.group({
        payment_method: ['', [Validators.required]],
        amount: ['', [Validators.required, Validators.min]],
        account_number: ['', [Validators.required]],
        account_holder: [''],
        bank: [''],
        // verification_code: ['', [Validators.required]],
        origin:[""],

      }),
      step:1
    },
    'Local':{
      'form':this.fb.group({
        payment_method: ['', [Validators.required]],
        amount: ['', [Validators.required, Validators.min]],
        account_number: ['', [Validators.required]],
        account_holder: ['', [Validators.required]],
        bank: ['', [Validators.required]],
        // verification_code: ['', [Validators.required]],
        origin:[""],
      }),
      step:1

    },
  }

  formView: Record<FormPageGroup, any> = {
    deposit:this.fb.group({
      amount:['',[Validators.required]],
      payment_method:["", [Validators.required]],

    }),
    withdraw:0
  }

  bindingTg=false
  isCountingDown = false;
  countdown = 60;
  timer: any;

  initializedMode=[]

  sender_account_number:any
  senders_name:any
  localDepositSendersName:any
  LocalDepositSenderAccNum:any

  hasPin:any=null
  addNewAddress:any

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {

        if (!event.urlAfterRedirects.includes('records')) {
          this.initPaymentMethod();
        }

      });
  }

  /** Initialize the user's payment method from localStorage or default */
  initPaymentMethod(): void {
    const saved = localStorage.getItem('payment_method') as PaymentMethod | null;
    const mode = saved || 'BANK';
    this.paymentMethod$.next(mode);
    this.selectedMode=mode;
    this.page = location.pathname.replaceAll("/wallet/","")
     this.storeData.get('wallet')&&this.storeData.get(this.page)?this.setPaymentMode("","",true):0;

  }

  /** Set and persist payment method */
  setPaymentMode(mode: any | null = null,method: any | null = null, initializing=false): void {

    method=this.storeData.get('hasMethod')?.code

    const pageData = this.storeData.get(this.page)
    console.log({pageData});

    if (!mode) {
      mode = this.storeData.get('hasMethod')?.code || pageData[0]?.method || this.selectedMode
      if (!['TRON',"USD"].includes(mode)) {
        mode="BANK"
      }
    }
    if (!method) {method=mode}

    method='NGN'

    this.initCurrencies=this.storeData.get('wallet').init_currencies
    this.paymentMethod$.next(mode);
    localStorage.setItem('payment_method', method);
    this.selectedMode=mode
    this.setSelectedCurrency(method)

    if (this.page==='withdraw') {
      if (mode==="BANK") {this.activeForm="Local"}else{this.activeForm="Crypto"}
      this.methodView[this.activeForm].form.patchValue({payment_method:method})
    }else{
      this.formView['deposit'].patchValue({payment_method:method});
      initializing?this.setDepositView():0;
    }

    console.log(this.minimumPayment);
    // console.log(this.storeData.store);



  }

  /** Get current value */
  getPaymentMethod(): PaymentMethod {
    return this.paymentMethod$.value;
  }

  /** Observable for reactive components */
  getPaymentMethod$() {
    return this.paymentMethod$.asObservable();
  }

  onCurrencySelect(event:Event){
    let selected = event.target as HTMLInputElement;
    this.setSelectedCurrency(selected.value.toUpperCase())
  }

  setSelectedCurrency(code:string){

    let[getSelectedData] = this.initCurrencies.filter((c:any)=>c.code===code)

    // console.log({getSelectedData,code});

    if (getSelectedData) {
      this.selectedCurrency=getSelectedData
      if (code==='TRON') {
        this.minimumPayment=this.convertUsdToTrx(this.storeData.get('wallet').settings['minimum_'+this.page] ,getSelectedData.rate)
      }else{
        this.minimumPayment=this.storeData.get('wallet').settings['minimum_'+this.page] //* getSelectedData.rate
      }
    }else{
      this.selectedCurrency="";
      this.minimumPayment=0
    }

    console.log('minimumPayment>>', this.minimumPayment);
    // if (this.hasPin===null) {
    //   this
    // }
    //
    // this.h


  }

  convertUsdToTrx(usd: number, rate: number = 0.322407): number {
    return +(usd / rate).toFixed(2);
  }

  handleSubmit(form:any,processor:any){

    this.addNewAddress=false;

    this.formHandler.submitForm(form, processor, 'wallet/send_request/?showSpinner', true,  (res) => {

      console.log({res});

      if (res.payment_link) {
        //open a new tab url
        window.open(res.payment_link, '_blank'); // opens in a new tab
      }

    })
  }

  cancelPayment(type:any='deposit', callback:any=null){

    this.reqConfirmation.confirmAction(()=>{
      this.reqServerData.get(`wallet/get_data/?dir=delete_${type}&showSpinner`).subscribe({
        next:(res)=>{
            callback?callback():0;
        }
      })
    }, 'Delete', `Continue to delete ${type} ?` )
  }

  paymentMode(method:any='USD'){

    let mode="bank"
    if (this.cryptoCoins.includes(method)) {
      mode='crypto'
    }
    return mode

  }

  copyContent(text:any){
    copyContent(this.toast,text)
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Optional: preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);

    }
    console.log({previewUrl:this.previewUrl});

  }

  setSelectedFile(formData:any): void {
    if (!this.selectedFile) return;
    formData.append('image', this.selectedFile); // key must match Django's expected field name
  }

  paymentCompleted(){

    const formData = new FormData();

    formData.append('origin', window.location.origin)
    formData.append('senders_name', this.localDepositSendersName)
    formData.append('senders_account_number', this.LocalDepositSenderAccNum)
    formData.append('processor', "payment_completed")
    // this.setSelectedFile(formData)
      this.reqServerData.post("wallet/send_request/?showSpinner/",formData).subscribe(
        // {
        //   next: res => {
        //     console.log({res});
        //     this.setDepositView()
        //
        //   }
        // }
      )
  }

  // set DepositView
  setDepositView(){
    const pendingDeposit= this.storeData.get('deposit')
    if (pendingDeposit.length&&pendingDeposit[0]?.proof) {
      this.previewUrl=pendingDeposit[0].proof
    }
  }

  // send withdrawal (OTP) code
  sendCode(method: 'email' | 'telegram' ='email') {

    console.log({method});

    let Continue = ()=>{
    if (method==='telegram'&&!this.storeData.get('bindedTg')) {
        this.bindingTg=true
        // this.telegram.connect()
        return
    }
    this.reqServerData.post("wallet/?showSpinner",{processor:'verification_code',method}).subscribe({next: res => {
      this.startCountdown(60); // 60 seconds timer
    }})
  }

  if (this.bindingTg) {
    this.bindingTg=false
    this.reqServerData.get("main").subscribe({next: res => Continue()})
  }else{Continue()}




  }

  startCountdown(seconds:number=60): void {
    // Example: trigger your backend API to send the OTP here
    // this.walletService.sendOtp();

    this.isCountingDown = true;
    this.countdown = seconds;

    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.timer);
        this.isCountingDown = false;
      }
    }, 1000);
  }

}
