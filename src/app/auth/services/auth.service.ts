import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';

import * as jwt_decode from 'jwt-decode';

import { environment } from 'src/environments/environment';

import { NewUser } from '../models/newUser.model';
import { Role, User } from '../models/user.model';
import { UserResponse } from '../models/userResponse.model';

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
            filter((user: User | null) => user !== null), // Filtrer les valeurs null
            switchMap((user: User) => {
                const isLoggedIn = !!user; // Vérifier si l'utilisateur est connecté
                return of(isLoggedIn);
            })
        );
    }

  get userRole(): Observable<Role> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        return of(user?.role); // for after signed out, but still subscribed
      })
    );
  }

  get userId(): Observable<number> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        return of(user.id);
      })
    );
  }

  get userFullName(): Observable<string> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        if (!user) {
          return of(null);
        }
        const fullName = user.firstName + ' ' + user.lastName;
        return of(fullName);
      })
    );
  }

  get userFullImagePath(): Observable<string> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        const doesAuthorHaveImage = !!user?.imagePath;
        let fullImagePath = this.getDefaultFullImagePath();
        if (doesAuthorHaveImage) {
          fullImagePath = this.getFullImagePath(user.imagePath);
        }
        return of(fullImagePath);
      })
    );
  }

  constructor(private http: HttpClient, private router: Router) {}

  getDefaultFullImagePath(): string {
    return 'http://localhost:3000/api/feed/image/blank-profile-picture.png';
  }

  getFullImagePath(imageName: string | undefined): string {
    return 'http://localhost:3000/api/feed/image/' + imageName;
  }

  getUserImage() {
    return this.http.get(`${environment.baseApiUrl}/user/image`).pipe(take(1));
  }

  getUserImageName(): Observable<{ imageName: string }> {
    return this.http
      .get<{ imageName: string }>(`${environment.baseApiUrl}/user/image-name`)
      .pipe(take(1));
  }

  updateUserImagePath(imagePath: string): Observable<User> {
    return this.user$.pipe(
      take(1),
      map((user: User) => {
        user.imagePath = imagePath;
        this.user$.next(user);
        return user;
      })
    );
  }

  uploadUserImage(
    formData: FormData
  ): Observable<{ modifiedFileName: string }> {
    return this.http
      .post<{ modifiedFileName: string }>(
        `${environment.baseApiUrl}/user/upload`,
        formData
      )
      .pipe(
        tap(({ modifiedFileName }) => {
          let user = this.user$.value;
          user.imagePath = modifiedFileName;
          this.user$.next(user);
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
            map((data: { value: string | null }) => { // Gérer la possibilité de null
                if (!data || !data.value) return false; // Gérer la possibilité de null

                const decodedToken: UserResponse = jwt_decode(data.value);
                const jwtExpirationInMsSinceUnixEpoch = decodedToken.exp * 1000;
                const isExpired =
                    new Date() > new Date(jwtExpirationInMsSinceUnixEpoch);

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
        this.user$.next(null); // Définir sur null lors de la déconnexion
        Storage.remove({ key: 'token' });
        this.router.navigateByUrl('/auth');
    }
}
