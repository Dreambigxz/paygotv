import { Component, inject, OnInit,ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {FormGroup, FormControl} from '@angular/forms';

import { ApiService } from "../api/api.service";
import { AuthService } from "../auth/auth.service";
import { DataService } from "../user/data.service";

import {ReactiveFormsModule, FormsModule} from '@angular/forms';

import { SimpleDialogComponent } from "../simple-dialog/simple-dialog.component";
import { MatDialog } from '@angular/material/dialog';

import { RouterLink, ActivatedRoute, Router} from '@angular/router';

import { copyContent } from '../../helper';
import { PaidComponent } from "../modal/paid/paid.component";
import { OtpComponent } from "../modal/otp/otp.component";

// import { NgxQrcodeStylingModule } from 'ngx-qrcode-styling';
import { Observable, of } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
//

import { QRCodeComponent } from 'angularx-qrcode';
import { GoogleAuthComponent } from "../google-auth/google-auth.component";

import { SpinnerComponent } from '../reuseables/http-loader/spinner.component';

import { CurrencyConverterPipe } from '../reuseables/pipes/currency-converter.pipe';
import { Header2Component } from "../components/header2/header2.component";
import { MenuBottomComponent } from "../components/menu-bottom/menu-bottom.component";

import { QuickNavService } from '../reuseables/services/quick-nav.service';

import { WalletService } from '../reuseables/services/wallet.service';
import { CountdownPipe } from '../reuseables/pipes/countdown.pipe';


@Component({
  selector: 'app-wallet',
  imports: [
    ReactiveFormsModule,RouterLink,CommonModule,
    PaidComponent,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    QRCodeComponent,
    SpinnerComponent,
    Header2Component,
    CountdownPipe,
    CurrencyConverterPipe
    //
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css'
})
export class WalletComponent {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
  ) {}

  copyContent = copyContent


  directory!:string

  loading=false
  isLoadingContent = false
  forceClose2fa= false
  history = window.history


  awaitingDeposit :any //(this.serviceData.userData as any).awaitingDeposit
  withdrawalInfo :any// (this.serviceData.userData as any).withdrawalInfo

  wallet: any
  initCurrency:any

  addNewAddress = false

  walletForm = new FormGroup({
    amount: new FormControl(''),
    selectedAddress: new FormControl(''),
    pin: new FormControl(''),

  })

  addAddressForm = new FormGroup({
    account_number: new FormControl(''),
    account_holder: new FormControl(''),
    bank: new FormControl(''),
    pin: new FormControl(''),
  })

  extraField:any

  quickNav = inject(QuickNavService)
  walletService  = inject(WalletService)

  walletAddress: string = ''; // Example Bitcoin address
  amount: number = 0.005;
  copied: boolean = false;


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const action = params.get('action');
      this.directory=`${action}`

      if (this.directory==='deposit') {
        if (!this.quickNav.storeData.get('deposit')) {
          this.quickNav.reqServerData.get('wallet/get_data?dir=start_deposit').subscribe((res)=>{
          this.walletService.setPaymentMode("", "", true);

        })}
      }

      else if(this.directory==='withdraw'){
        if (!this.quickNav.storeData.get('withdraw')) {
          this.quickNav.reqServerData.get('wallet/get_data?dir=start_withdraw').subscribe((res)=>{
          this.walletService.setPaymentMode("", "", true);

          console.log({res});

        })}
      }else{
        if (!this.quickNav.storeData.get('transaction')) {
          this.quickNav.reqServerData.get('wallet/get_data?dir=start_transactions').subscribe((res)=>{
          console.log({res});
          this.transactions  = res.main.transactions
          this.startTransaction()

        })}
      }
    });
  }


  paymentCompletedModal=false

  deleteAction(action:any){
    const dialogRef = this.dialog.open(SimpleDialogComponent,{
      data:{message:"Are you sure you want to continue?",header:'Delete!', color:'red',confirmation:true},
      // width:200px
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(true);

      }
    });
  }

  copyAddress(item=this.walletAddress,dialog=false) {
    navigator.clipboard.writeText(item).then(() => {
      dialog?[this.dialog.open(SimpleDialogComponent,{
        data:{message: item+' successfully copied',header:'Success',color:'green'},
      })]:this.copied = true;
      setTimeout(() => this.copied = false, 3000);
    });
  }

  //Transaction view

  transactions:any;

  startTransaction (){
    this.allTransactions = this.transactions;
    this.filteredTransactions=[...this.allTransactions]
      this.updatePagedTransactions();
  }

  selectedType: string = 'All';
  dateFrom: string = '';
  dateTo: string = '';

  displayedColumns: string[] = ['type', 'amount', 'date', 'status'];
  allTransactions: any[] = [] //this.transactions

  filteredTransactions:any[]=[] //= [...this.allTransactions];
  pagedTransactions: any[] = [];
  pageSize = 25;
  currentPage = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedTransactions();
  }

  updatePagedTransactions(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.pagedTransactions = this.filteredTransactions.slice(start, end);
  }

  applyFilters() {
   this.filteredTransactions = this.allTransactions.filter((tx) => {
     const txDate = new Date(tx.date);
     const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
     const toDate = this.dateTo ? new Date(this.dateTo) : null;

     return (
       (this.selectedType === 'All' || tx.type === this.selectedType) &&
       (!fromDate || txDate >= fromDate) &&
       (!toDate || txDate <= toDate)
     );
   });

   // this.calculateTotals();
   this.setPage(0, 5);
 }
 //
   // calculateTotals() {
   //   this.totalDeposit = this.filteredTransactions
   //     .filter(t => t.type === 'Deposit')
   //     .reduce((sum, t) => sum + t.amount, 0);
   //   this.totalWithdrawal = this.filteredTransactions
   //     .filter(t => t.type === 'Withdrawal')
   //     .reduce((sum, t) => sum + t.amount, 0);
   // }

 //   onPageChange(event: PageEvent) {
 //     this.setPage(event.pageIndex, event.pageSize);
 //   }
 //
   setPage(index: number, size: number) {
     const start = index * size;
     this.pagedTransactions = this.filteredTransactions.slice(start, start + size);
   }

}
