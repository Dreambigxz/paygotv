import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateCenter',
  standalone: true  // 👈 required for global import
})
export class TruncateCenterPipe implements PipeTransform {
  transform(value: string, front: number = 6, back: number = 6): string {
    if (!value) return '';
    if (value.length <= front + back) return value;
    return `${value.slice(0, front)}...${value.slice(-back)}`;
  }
}
