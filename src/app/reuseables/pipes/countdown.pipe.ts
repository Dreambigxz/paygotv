import { Pipe, PipeTransform, ChangeDetectorRef, NgZone, inject} from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map, startWith, takeWhile } from 'rxjs/operators';

@Pipe({
  name: 'countdown',
  standalone: true,
  pure: false
})
export class CountdownPipe implements PipeTransform {
  private timer$: Observable<string | null> | null = null;
  private lastTarget: any = null;


  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  transform(targetDate: Date | string | number, addHours: number = 0,source:any=0): Observable<string | null> {
    if (!targetDate) return new Observable((obs) => obs.next(null));

    // 🧭 Normalize input
    const start = new Date(
      typeof targetDate === 'number'
        ? targetDate * 1000
        : typeof targetDate === 'string' && /^\d+$/.test(targetDate)
          ? parseInt(targetDate) * 1000
          : targetDate
    ).getTime();

    const settleAt = addHours ? start + addHours * 60 * 60 * 1000 : start;


    // ⚡ Reuse existing timer if same input
    if (this.lastTarget === settleAt && this.timer$) return this.timer$;
    this.lastTarget = settleAt;

    // ✅ Create observable timer outside Angular zone
    this.zone.runOutsideAngular(() => {
      this.timer$ = interval(1000).pipe(
        startWith(0),
        map(() => {
          const now = Date.now();
          const diff = settleAt - now;

          if (diff <= 0) {

            return null
          };

          const totalSeconds = Math.floor(diff / 1000);
          const days = Math.floor(totalSeconds / (3600 * 24));
          const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          const formatted = `${days ? days + 'd ' : ''}${hours}h ${minutes
            .toString()
            .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

          // ✅ Let Angular know to refresh view safely
          this.zone.run(() => this.cdr.markForCheck());


          return formatted;
        }),
        takeWhile((val) => val !== null, true)
      );
    });

    return this.timer$!;
  }
}
