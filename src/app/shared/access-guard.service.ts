import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {ElectronService} from '../core/services';

@Injectable({
  providedIn: 'root'
})
export class AccessGuard implements CanActivate {

  limitAccessHosts: string[] = [
    'stunden.eisenstecken.kivi.bz.it',
    '192.168.0.7',
    '127.0.0.1',
    'localhost'
  ];

  constructor(private authService: AuthService, private router: Router, private electron: ElectronService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiresLogin = route.data.requiresLogin || true;
    if (requiresLogin) {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['login']);
      }
    }
    this.redirectWorkHours();
    return true;
  }

  private redirectWorkHours(): void {
    console.log('Host is: ' + window.location.hostname);
    if (this.limitAccessHosts.includes(window.location.hostname)) {
      if (!this.router.url.startsWith('/work_day') || !this.router.url.startsWith('/login')) {
        if (!this.electron.isElectron) {
          this.router.navigateByUrl('/work_day'); //before introducing this again, s
        }
      }
    } else {
      console.log('Internal Route');
    }
  }

}
