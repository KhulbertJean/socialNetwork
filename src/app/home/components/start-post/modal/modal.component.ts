import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @ViewChild('form', { static: true }) form!: NgForm; // Utilisation de l'opérateur de non-null assertion

  @Input() postId?: number;

  fullName$ = new BehaviorSubject<string>(''); // Définition d'une valeur par défaut
  fullName = '';

  userFullImagePath: string = ''; // Initialisation de la propriété
  private userImagePathSubscription!: Subscription; // Utilisation de l'opérateur de non-null assertion

  constructor(
      public modalController: ModalController,
      private authService: AuthService
  ) {}

  ngOnInit() {
    this.userImagePathSubscription =
        this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
          this.userFullImagePath = fullImagePath;
        });

    this.authService.userFullName
        .pipe(take(1))
        .subscribe((fullName: string) => {
          this.fullName = fullName;
          this.fullName$.next(fullName);
        });
  }

  onDismiss() {
    this.modalController.dismiss(null, 'dismiss');
  }

  onPost() {
    if (!this.form.valid) return;
    const body = this.form.controls['body'].value;
    this.modalController.dismiss(
        {
          post: {
            body,
          },
        },
        'post'
    );
  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
  }
}