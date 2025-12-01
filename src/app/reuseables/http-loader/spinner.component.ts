import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderService } from './loader.service';
import { Observable, of} from 'rxjs';

// <div class="spinner"></div>
// <div *ngIf="isLoading | async" class="spinner-overlay"> <div class="spinner"></div> </div>
@Component({
  selector: 'app-spinner',
  imports: [ CommonModule],

  template: `

  <div *ngIf="isLoading | async"  id="spinner-div" class="pt-5">
  <div id="loading-bar-spinner" class="spinner loader"><div class="spinner-icon"></div></div>

  </div>
  `,
  styles: [`
    #spinner-div {
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      text-align: center;
      /* background-color: rgba(255, 255, 255, 0.8); */
      background-color: rgba(0, 0, 0, 0.43);
      z-index: 999999999;
    };
    #spinner-div{animation-delay: 500ms}

    #spinner-div .spinner-grow.text-primary{
      margin-top:50%
    }

    #loading-bar-spinner.spinner {
      left: 50%;
      margin-left: -20px;
      top: 50%;
      margin-top: -20px;
      position: absolute;
      z-index: 19 !important;
      animation: animloader 2s linear infinite;
  }



  .loader {
      width: 58px;
      height: 58px;
      display: inline-block;
      position: relative;
    }
    .loader::after,
    .loader::before {
      content: '';
      box-sizing: border-box;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: 4px solid #FFF;
      position: absolute;
      left: 0;
      top: 0;
      animation: animloader 2s linear infinite;
    }
    .loader::after {
      animation-delay: 1s;
    }


  @keyframes animloader {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    }
  `]
})
export class SpinnerComponent {
    isLoading: Observable<boolean>;
   constructor(private loaderService: LoaderService) {
     this.isLoading = this.loaderService.loading$; // ✅ safe
   }

}
