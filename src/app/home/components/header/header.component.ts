import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take, tap} from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service.js';
import { PopoverComponent } from './popover/popover.component.js';
import { ConnectionProfileService } from "../../services/connection-profile.service.js";
import {FriendRequest} from "../../models/FriendRequest.js";
import {FriendRequestsPopoverComponent} from "./friend-requests-popover/friend-requests-popover.component.js";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userFullImagePath!: string;
  fullName!: string;
  private userImagePathSubscription!: Subscription;

  friendRequests!: FriendRequest[];
  private friendRequestsSubscription!: Subscription;

  constructor(
      public popoverController: PopoverController,
      private authService: AuthService,
      public connectionProfileService: ConnectionProfileService
  ) {}

  ngOnInit() {
    this.authService
        .getUserImageName()
        .pipe(
            take(1),
            tap(({ imageName }) => {
              const defaultImagePath = 'blank-profile-picture.png';
              this.authService
                  .updateUserImagePath(imageName || defaultImagePath);
            })
        )
        .subscribe();

    this.userImagePathSubscription =
        this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
          this.userFullImagePath = fullImagePath;
        });

    this.authService.userFullName
        .pipe(
            take(1)
        )
        .subscribe((fullName: string | null) => {
          if (fullName) {
            this.fullName = fullName;
          }
        });
    this.friendRequests = [];

    this.friendRequestsSubscription = this.connectionProfileService
        .getFriendRequests()
        .subscribe((friendRequests: FriendRequest[]) => {
          this.friendRequests = friendRequests.filter(
              (friendRequest: FriendRequest) => friendRequest.status === 'pending'
          );
        });
  }



  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      cssClass: 'my-custom-class',
      event: ev,
      showBackdrop: false,
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async presentFriendRequestPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: FriendRequestsPopoverComponent,
      cssClass: 'my-custom-class',
      event: ev,
      showBackdrop: false,
    });
    await popover.present();

    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
    this.friendRequestsSubscription.unsubscribe();
  }
}
