import {Pipe, PipeTransform} from '@angular/core';
import {Right} from 'eisenstecken-openapi-angular-library';

@Pipe({
  name: 'rightsFilter',
  pure: false
})
export class MyFilterPipe implements PipeTransform {
  transform(items: Right[], filter: string): any {
    if (!items || !filter) {
      return items;
    }
    return items.filter(item => item.key.startsWith(filter));
  }
}

@Pipe({
  name: 'splitTextNewline',
  pure: false
})
export class SplitTextNewlinePipe implements PipeTransform {
  transform(item: string): any {
    return item.split('\n');
  }
}
