import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, switchMap, take, tap} from 'rxjs/operators';

const jwt_decode = require('jwt-decode');
import { environment } from 'src/environments/environment.js';
import { NewUser } from '../models/newUser.model.js';
import { Role, User } from '../models/user.model.js';
import { UserResponse } from '../models/userResponse.model.js';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private user$ = new BehaviorSubject<User | null>(null);

    private httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    get userStream(): Observable<User | null> {
        return this.user$.asObservable();
    }

    isUserLoggedIn(): Observable<boolean> {
        return this.user$.asObservable().pipe(
            map((user: User | null) => !!user)
        );
    }

    get userRole(): Observable<Role> {
        return this.user$.asObservable().pipe(
            switchMap((user: User | null) => {
                return of(user?.role);
            }),
            map((role: Role | null | undefined) => {
                if (role === null || role === undefined) {
                    return 'defaultRole' as Role;
                } else {
                    return role;
                }
            })
        );
    }

    get userId(): Observable<number> {
        return this.user$.asObservable().pipe(
            switchMap((user: User | null) => {
                return of(user?.id ?? -1);
            })
        );
    }

    get userFullName(): Observable<string | null> {
        return this.user$.asObservable().pipe(
            switchMap((user: User | null) => {
                if (!user) {
                    return of(null);
                }
                const fullName = `${user.firstName} ${user.lastName}`;
                return of(fullName);
            })
        );
    }

    get userFullImagePath(): Observable<string> {
        return this.user$.asObservable().pipe(
            switchMap((user: User | null) => {
                if (user && user.imagePath) {
                    return of(this.getFullImagePath(user.imagePath));
                } else {
                    return of(this.getDefaultFullImagePath());
                }
            })
        );
    }

    constructor(private http: HttpClient, private router: Router) {}

    getDefaultFullImagePath(): string {
        return 'http://localhost:3000/api/feed/image/blank-profile-picture.png';
    }

    getFullImagePath(imageName: string): string {
        return 'http://localhost:3000/api/feed/image/' + imageName;
    }

    getUserImage(): Observable<any> {
        return this.http.get(`${environment.baseApiUrl}/user/image`).pipe(take(1));
    }

    getUserImageName(): Observable<{ imageName: string }> {
        return this.http
            .get<{ imageName: string }>(`${environment.baseApiUrl}/user/image-name`)
            .pipe(take(1));
    }

    updateUserImagePath(imagePath: string): void {
        const user = this.user$.value;
        if (user) {
            user.imagePath = imagePath;
            this.user$.next(user);
        }
    }

    uploadUserImage(formData: FormData): Observable<{ modifiedFileName: string }> {
        return this.http
            .post<{ modifiedFileName: string }>(
                `${environment.baseApiUrl}/user/upload`,
                formData
            )
            .pipe(
                tap(({ modifiedFileName }) => {
                    this.updateUserImagePath(modifiedFileName);
                })
            );
    }

    register(newUser: NewUser): Observable<User> {
        return this.http
            .post<User>(
                `${environment.baseApiUrl}/auth/register`,
                newUser,
                this.httpOptions
            )
            .pipe(take(1));
    }

    login(email: string, password: string): Observable<{ token: string }> {
        return this.http
            .post<{ token: string }>(
                `${environment.baseApiUrl}/auth/login`,
                { email, password },
                this.httpOptions
            )
            .pipe(
                take(1),
                tap((response: { token: string }) => {
                    Storage.set({
                        key: 'token',
                        value: response.token,
                    });
                    const decodedToken: UserResponse = jwt_decode(response.token);
                    this.user$.next(decodedToken.user);
                })
            );
    }

    isTokenInStorage(): Observable<boolean> {
        return from(
            Storage.get({
                key: 'token',
            })
        ).pipe(
            map((data: { value: string | null }) => {
                if (!data || !data.value) return false;

                const decodedToken: UserResponse = jwt_decode(data.value);
                const jwtExpirationInMsSinceUnixEpoch = decodedToken.exp * 1000;
                const isExpired = new Date() > new Date(jwtExpirationInMsSinceUnixEpoch);

                if (isExpired) return false;
                if (decodedToken.user) {
                    this.user$.next(decodedToken.user);
                    return true;
                }
                return false;
            })
        );
    }

    logout(): void {
        this.user$.next(null);
        Storage.remove({ key: 'token' });
        this.router.navigateByUrl('/auth');
    }
}
