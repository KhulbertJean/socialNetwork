import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { take, tap } from 'rxjs/operators';
import { User } from 'src/app/auth/models/user.model.js';

import { FriendRequest } from "../../../models/FriendRequest.js";
import { ConnectionProfileService } from "../../../services/connection-profile.service.js";

@Component({
    selector: 'app-friend-requests-popover',
    templateUrl: './friend-requests-popover.component.html',
    styleUrls: ['./friend-requests-popover.component.scss'],
})
export class FriendRequestsPopoverComponent implements OnInit {
    friendRequests: FriendRequest[] = [];

    constructor(
        public connectionProfileService: ConnectionProfileService,
        private popoverController: PopoverController
    ) {}

    ngOnInit() {
        this.connectionProfileService.getFriendRequests().pipe(
            tap((friendRequests: FriendRequest[]) => {
                this.friendRequests = friendRequests;
                this.processFriendRequests();
            })
        ).subscribe();
    }

    async processFriendRequests() {
        for (const friendRequest of this.friendRequests) {
            if (friendRequest && friendRequest.creatorId !== undefined) { // Vérifiez la nullité ici
                try {
                    const user: User | undefined = await this.connectionProfileService.getConnectionUser(friendRequest.creatorId).pipe(take(1)).toPromise();
                    if (user && friendRequest) { // Assurez-vous que friendRequest est défini
                        friendRequest.fullImagePath = 'http://localhost:3000/api/feed/image/' + (user.imagePath || 'blank-profile-picture.png');
                        friendRequest.creator = user;
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération de l\'utilisateur :', error);
                }
            }
        }
    }

    async respondToFriendRequest(id: number, statusResponse: 'accepted' | 'declined') {
        const handledFriendRequest = this.friendRequests.find((friendRequest) => friendRequest.id === id);

        if (!handledFriendRequest) {
            console.error('La demande d\'ami n\'a pas été trouvée');
            return;
        }

        const unhandledFriendRequests = this.friendRequests.filter((friendRequest) => friendRequest.id !== id);

        this.connectionProfileService.setFriendRequests(unhandledFriendRequests);

        if (unhandledFriendRequests.length === 0) {
            await this.popoverController.dismiss();
        }

        this.connectionProfileService.respondToFriendRequest(id, statusResponse).pipe(take(1)).subscribe();
    }
}
