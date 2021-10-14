import {Injectable, Injector} from '@angular/core';
import {DefaultService, Right, User} from 'eisenstecken-openapi-angular-library';
import {Router} from '@angular/router';
import {Observable, ReplaySubject} from 'rxjs';
import {first, map} from 'rxjs/operators';


export function containsRight(rightString: string, rights: Right[]): boolean {
    for (const right of rights) {
        if (rightString === right.key) {
            return true;
        }
    }
    return false;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    static accessTokenKey = 'access_token';
    private user: ReplaySubject<User>;

    constructor(private injector: Injector, private router: Router) {
    }

    getToken(): string {
        return localStorage.getItem(AuthService.accessTokenKey);
    }

    setToken(token: string): void {
        localStorage.setItem(AuthService.accessTokenKey, token);
        this.injector.get<DefaultService>(DefaultService).configuration.credentials.OAuth2PasswordBearer = token;
    }

    removeToken(): void {
        localStorage.removeItem(AuthService.accessTokenKey);
        this.injector.get<DefaultService>(DefaultService).configuration.credentials.OAuth2PasswordBearer = null;
    }

    isLoggedIn(): boolean {
        const authToken = this.getToken();
        return (authToken !== null);
    }

    doLogout(): void {
        this.removeToken();
        this.router.navigateByUrl('login');
        console.log('Login Success');
    }

    async getScopeString(): Promise<string> {
        const rights = await this.getRights();
        const rightArray: string[] = rights.map((elem) => elem.key);
        const scope = rightArray.join(' ');
        console.log('Using scope:' + scope);
        return scope;
    }

    async getRights(): Promise<Right[]> {
        const rights = this.injector.get<DefaultService>(DefaultService).getRightsRightsGet();
        return await rights.toPromise();
    }

    async login(username: string, password: string): Promise<boolean> {
        const tokenObservable = this.injector.get<DefaultService>(DefaultService)
            .loginForAccessTokenTokenPost(username, password, true, 'password', await this.getScopeString());
        return new Promise<boolean>((resolve, reject) => {
            tokenObservable.subscribe((token) => {
                if (token.access_token.length > 0) {
                    this.setToken(token.access_token);
                }
                resolve(true);
            }, (error) => {
                console.error('Unable to login');
                console.error(error);
                resolve(false);
            }, () => {
                reject('TIMEOUT: No Internet');
            });
        });
    }

    getCurrentUser(): ReplaySubject<User> {
        if (this.user === undefined || this.user === null) {
            this.user = new ReplaySubject<User>(1);
            this.injector.get<DefaultService>(DefaultService).readUsersMeUsersMeGet().pipe(first()).subscribe(this.user);
        }
        return this.user;
    }

    currentUserHasRight(right: string): Observable<boolean> {
        return this.getCurrentUser().pipe(map(
            user => containsRight(right, user.rights)
        ));
    }
}

