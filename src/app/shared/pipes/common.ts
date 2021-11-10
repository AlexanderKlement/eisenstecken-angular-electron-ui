import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'splitTextNewline',
    pure: false
})
export class SplitTextNewlinePipe implements PipeTransform {
    transform(item: string): any {
        return item.split('\n');
    }
}
