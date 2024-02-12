import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { from, Observable } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return from(Storage.get({ key: 'token' })).pipe(
            switchMap((data: { value: string | null }) => {
                const token = data?.value;
                if (token) {
                    const clonedRequest = req.clone({
                        headers: req.headers.set('Authorization', 'Bearer ' + token),
                    });
                    return next.handle(clonedRequest);
                } else {
                    // Si aucun token n'est trouvé, continuer avec la requête d'origine
                    return next.handle(req);
                }
            }),
            catchError(error => {
                // Gérer les erreurs éventuelles
                console.error('Error fetching token from storage:', error);
                return []; // Retourner un tableau vide en cas d'erreur pour éviter les valeurs null
            }),
            filter(response => response !== null) // Filtrer les valeurs null
        );
    }

    constructor() {}
}
