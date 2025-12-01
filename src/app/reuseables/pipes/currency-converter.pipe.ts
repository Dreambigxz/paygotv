import { Pipe, PipeTransform, inject } from '@angular/core';
import { StoreDataService } from '../http-loader/store-data.service'; // ✅ adjust path as needed

@Pipe({
  name: 'currencyConverter',
  standalone: true, // ✅ must be standalone
  // providedIn: 'root' // 👈 THIS makes it injectable in services

})
export class CurrencyConverterPipe implements PipeTransform {
  private storeData = inject(StoreDataService);

  transform(amount: number=0, showSymbol: boolean = false, another_currency=false,minimumFractionDigits:number=2): string {

    const wallet = this.storeData.get('wallet');
    let init_currency=wallet?.init_currency
    if (another_currency) {
      [init_currency] = wallet.init_currencies.filter((c:any)=>c.code===another_currency)
    }


    const rate = init_currency?.rate || 1;
    const symbol = init_currency?.symbol || '';
    let converted;

    if (symbol==='trx') {
      converted = amount / rate;
    }else{
      converted = amount// * rate;
    }
    return showSymbol
      ? `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : converted.toFixed(minimumFractionDigits);
  }
}
