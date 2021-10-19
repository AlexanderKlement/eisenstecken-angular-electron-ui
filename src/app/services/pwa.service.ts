import { Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {PwaDialogComponent} from '../pwa-dialog/pwa-dialog.component';
import {ElectronService} from '../core/services';
import {timer} from 'rxjs';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;

  constructor(    private bottomSheet: MatBottomSheet,
                  private platform: Platform, private electron: ElectronService) {

  }

  public initPwaPrompt() {
    console.log('electron? '+this.electron.isElectron);
    console.log('platform android '+this.platform.ANDROID);
    console.log('platform ios '+this.platform.ANDROID);
    console.log('platform  webkit'+this.platform.WEBKIT);
    console.log('platform isBrowser '+this.platform.isBrowser);
    if(this.electron.isElectron)
      {return;}
    if (this.platform.ANDROID) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        console.log(event);
        this.promptEvent = event;
        this.openPromptComponent('android');
      });
    }
    if (this.platform.IOS) {
      // @ts-ignore
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);
      console.log('is in standaalone:'+ isInStandaloneMode);
      if (!isInStandaloneMode) {
        this.openPromptComponent('ios');
      }
    }
  }

  private openPromptComponent(mobileType: 'ios' | 'android') {
    console.log('Open: '+mobileType);
    console.log(this.promptEvent);
    timer(3000)
      .pipe(take(1))
      .subscribe(() => this.bottomSheet.open(PwaDialogComponent, { data: { mobileType, promptEvent: this.promptEvent } }));
  }
}
