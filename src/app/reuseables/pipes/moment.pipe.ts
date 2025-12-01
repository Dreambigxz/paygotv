// src/app/pipes/moment.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'momentAgo',
  standalone: true,
  pure: false, // allows it to auto-update (optional)
})
export class MomentAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return '';

    return moment(value).fromNow();
  }
}
