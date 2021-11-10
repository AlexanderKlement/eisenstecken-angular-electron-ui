import {Pipe, PipeTransform} from '@angular/core';
import {Right} from 'eisenstecken-openapi-angular-library';

@Pipe({
  name: 'RightFilter',
  pure: false
})
export class RightFilterPipe implements PipeTransform {
  transform(items: Right[], filter: string): any {
    if (!items || !filter) {
      return items;
    }
    return items.filter(item => item.key.startsWith(filter));
  }
}

