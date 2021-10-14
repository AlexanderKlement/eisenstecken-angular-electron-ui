import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AccessGuard implements CanActivate {

    fullAccessHosts: string[] = [
        'gui.eisenstecken.kivi.bz.it',
        'localhost'
    ];

    constructor(private authService: AuthService, private router: Router) {
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
        if (!this.fullAccessHosts.includes(window.location.hostname)) {
            console.log('External Route');
            console.log(this.router.url);
            if (!this.router.url.startsWith('/work_day') || !this.router.url.startsWith('/login')) {
                //this.router.navigateByUrl('/work_day');
            }
        } else {
            console.log('Internal Route');
        }
    }

}
