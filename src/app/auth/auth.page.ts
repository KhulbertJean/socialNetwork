import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NewUser } from './models/newUser.model.js';
import { AuthService } from './services/auth.service.js';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
})
export class AuthPage  {
    @ViewChild('form') form!: NgForm;

    submissionType: 'login' | 'join' = 'login';

    constructor(private authService: AuthService, private router: Router) {}



    onSubmit() {
        if (!this.form.valid) return; // Vérification de la validité du formulaire.

        const { email, password, firstName, lastName } = this.form.value;

        if (this.submissionType === 'login') {
            // Connexion
            this.authService.login(email, password).subscribe(() => {
                this.router.navigateByUrl('/home');
            });
        } else if (this.submissionType === 'join') {
            // Inscription
            const newUser: NewUser = { firstName, lastName, email, password };
            this.authService.register(newUser).subscribe(() => {
                this.toggleText(); // Basculer vers le mode de connexion après inscription réussie.
            });
        }
    }

    toggleText() {
        // Basculer entre le mode connexion et le mode inscription.
        this.submissionType = (this.submissionType === 'login') ? 'join' : 'login';
    }
}
