// src/app/reuseables/pipes/time-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {

  transform(timestamp: number | string | Date, format: 'time' | 'date' | 'fullDate' = 'time'): string {

    if (!timestamp) return '';

    const date = typeof timestamp === 'number'
      ? new Date(timestamp * 1000)  // convert seconds → milliseconds
      : typeof timestamp === 'string'
        ? new Date(timestamp)
        : timestamp;

    if (!(date instanceof Date) || isNaN(date.getTime())) return '';

    const options: Intl.DateTimeFormatOptions = {};

    switch (format) {
      case 'time':
        options.hour = 'numeric';
        options.minute = '2-digit';
        options.hour12 = true;
        // options
        break;

      case 'date':
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
        break;

      case 'fullDate':
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
        options.hour = 'numeric';
        options.minute = '2-digit';
        options.hour12 = true;
        break;
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
}
