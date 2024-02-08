import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user.model';
import { environment } from 'src/environments/environment';
import { FriendRequest, FriendRequestStatus } from "../models/FriendRequest";

@Injectable({
    providedIn: 'root',
})
export class ConnectionProfileService {
    private httpOptions: { headers: HttpHeaders } = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    constructor(private http: HttpClient) {}

    getConnectionUser(id: number): Observable<User> {
        return this.http.get<User>(`${environment.baseApiUrl}/user/${id}`).pipe(
            catchError(error => throwError('Erreur lors de la récupération de l\'utilisateur'))
        );
    }

    getFriendRequestStatus(id: number): Observable<FriendRequestStatus> {
        return this.http.get<FriendRequestStatus>(
            `${environment.baseApiUrl}/user/friend-request/status/${id}`
        ).pipe(
            catchError(error => throwError('Erreur lors de la récupération du statut de la demande d\'ami'))
        );
    }

    addConnectionUser(id: number): Observable<FriendRequest | { error: string }> {
        return this.http.post<FriendRequest | { error: string }>(
            `${environment.baseApiUrl}/user/friend-request/send/${id}`,
            {},
            this.httpOptions
        ).pipe(
            catchError(error => throwError('Erreur lors de l\'envoi de la demande d\'ami'))
        );
    }

    getFriendRequests(): Observable<FriendRequest[]> {
        return this.http.get<FriendRequest[]>(
            `${environment.baseApiUrl}/user/friend-request/me/received-requests`
        ).pipe(
            catchError(error => throwError('Erreur lors de la récupération des demandes d\'ami'))
        );
    }

    respondToFriendRequest(
        id: number,
        statusResponse: 'accepted' | 'declined'
    ): Observable<FriendRequest> {
        return this.http.put<FriendRequest>(
            `${environment.baseApiUrl}/user/friend-request/response/${id}`,
            { status: statusResponse },
            this.httpOptions
        ).pipe(
            catchError(error => throwError('Erreur lors de la réponse à la demande d\'ami'))
        );
    }
}
