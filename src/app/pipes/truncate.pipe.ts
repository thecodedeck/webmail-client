import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    // Truncate text to 50 characters and add ellipsis
    return (value as string).length > 50
      ? (value as string).substring(0, 50) + '...'
      : value;
  }
}
