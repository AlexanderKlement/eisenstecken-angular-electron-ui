import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private history: string[] = [];
  private backEventInProgress = false;

  constructor(private router: Router, private location: Location) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  back(): void {
    if(this.backEventInProgress){
      // eslint-disable-next-line no-console
      console.info("back navigation once prevented");
      this.backEventInProgress = false;
      return;
    }
    this.history.pop();
    if (this.history.length > 0) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }

  backEvent(): void {
    this.backEventInProgress = true;
  }

  home(): void {
    this.router.navigateByUrl('/');
  }

}
