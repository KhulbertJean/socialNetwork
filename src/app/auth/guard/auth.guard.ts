import { Injectable } from '@angular/core';
import { CanLoad, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {AuthService} from "../services/auth.service.js";



@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanLoad {
    constructor(private authService: AuthService, private router: Router) {
    }

    canLoad(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.authService.isUserLoggedIn().pipe(
            take(1),
            switchMap((isUserLoggedIn: boolean) => {
                if (isUserLoggedIn) {
                    return of(true);
                } else {
                    return this.authService.isTokenInStorage().pipe(
                        tap((tokenInStorage: boolean) => {
                            if (!tokenInStorage) {
                                this.router.navigateByUrl('/auth');
                            }
                        }),
                        map(() => false)
                    );
                }
            })
        );
    }
}
