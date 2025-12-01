import { Injectable, inject } from '@angular/core';
import { StoreDataService } from '../http-loader/store-data.service';
import { ConfirmationDialogService } from '../modals/confirmation-dialog/confirmation-dialog.service';
import { RequestDataService } from '../http-loader/request-data.service';
// import { CurrencyConverterPipe } from '../reuseables/pipes/currency-converter.pipe';

@Injectable({
  providedIn: 'root'
})
export class BetHistoryService {

  // private currencyConverter = inject(CurrencyConverterPipe);
  private storeData = inject(StoreDataService);
  private reqConfirmation = inject(ConfirmationDialogService);
  private reqServerData = inject(RequestDataService);

  allBets: any[] = []; // Cache storage

  /**
   * Get bet history filtered by status.
   * @param status - could be 'open', 'settled', 'won', 'lost', etc.
   */
   // bet-history.service.ts
    getHistory(status: string): Promise<any[]> {

      console.log("checking server>>");

      return new Promise((resolve, reject) => {
        if (this.allBets.length) {
          resolve(this.filterBets(status));
          return;
        }

        this.reqServerData.get('bet/?showSpinner').subscribe({
          next: (res: any) => {
            this.allBets = res?.data || [];
            resolve(this.filterBets(status));
          },
          error: (err) => reject(err)
        });
      });
    }

  /**
   * Filter bets by status.
   */
  private filterBets(status: string) {
    if (!status || status === 'all') {
      return this.allBets;
    }
    console.log('filtering>>', status);

    const filtered = this.allBets.filter(bet => bet.status === status);

    console.log('filtered>>', filtered);

    return filtered

  }

  /**
   * Called after fetching data — can categorize or reprocess tickets later.
   */
  private categorizeTicket(status: string) {
    // For now, just log the categorized bets
    const filtered = this.filterBets(status);
    console.log('Categorized Bets:', filtered);
  }
}
