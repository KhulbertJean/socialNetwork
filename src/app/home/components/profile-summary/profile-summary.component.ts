import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { FileTypeResult } from 'file-type';
import { fileTypeFromBuffer } from 'file-type';

import { BehaviorSubject, from, of, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { Role, User } from 'src/app/auth/models/user.model.js';
import { AuthService } from 'src/app/auth/services/auth.service.js';
import { BannerColorService } from '../../services/banner-color.service.js';

type validFileExtension = 'png' | 'jpg' | 'jpeg';
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

@Component({
    selector: 'app-profile-summary',
    templateUrl: './profile-summary.component.html',
    styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {
    form!: FormGroup;
    validFileExtensions: validFileExtension[] = ['png', 'jpg', 'jpeg'];
    validMimeTypes: validMimeType[] = ['image/png', 'image/jpg', 'image/jpeg'];
    userFullImagePath: string | undefined;
    private userImagePathSubscription!: Subscription;
    private userSubscription!: Subscription;
    fullName$ = new BehaviorSubject<string | null>(null);
    fullName = '';

    constructor(
        private authService: AuthService,
        public bannerColorService: BannerColorService
    ) {}

    ngOnInit() {
        this.form = new FormGroup({
            file: new FormControl(null),
        });

        this.userImagePathSubscription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
            this.userFullImagePath = fullImagePath;
        });

        this.userSubscription = this.authService.userStream.subscribe((user: User | null) => { // Modification ici
            if (user && user.role) {
                this.bannerColorService.bannerColors = this.bannerColorService.getBannerColors(user.role);
            }

            if (user && user.firstName && user.lastName) {
                this.fullName = user.firstName + ' ' + user.lastName;
                this.fullName$.next(this.fullName);
            }
        });
    }


    onFileSelect(event: Event): void {
        const fileInput = event.target as HTMLInputElement;
        const file: File | null = fileInput.files && fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        from(file.arrayBuffer())
            .pipe(
                switchMap((buffer: ArrayBuffer) => {
                  return from(fileTypeFromBuffer(buffer))
                    .pipe(
                      switchMap((fileTypeResult: FileTypeResult | undefined) => {
                        if (!fileTypeResult) {
                          console.log({error: 'file format not supported!'});
                          return of();
                        }
                        const {ext, mime} = fileTypeResult;
                        const isFileTypeLegit = this.validFileExtensions.includes(ext as validFileExtension);
                        const isMimeTypeLegit = this.validMimeTypes.includes(mime as validMimeType);
                        const isFileLegit = isFileTypeLegit && isMimeTypeLegit;
                        if (!isFileLegit) {
                          console.log({error: 'file format does not match file extension!'});
                          return of();
                        }
                        return this.authService.uploadUserImage(formData);
                      })
                    );
                })
            )
            .subscribe();

        this.form.reset();
    }

    ngOnDestroy() {
        this.userSubscription?.unsubscribe();
        this.userImagePathSubscription?.unsubscribe();
    }
}
