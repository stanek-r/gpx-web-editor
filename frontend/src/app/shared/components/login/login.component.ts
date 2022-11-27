import { Component, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { BlockUiService } from '../../../services/block-ui.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  @ViewChild('email') email!: ElementRef;
  @ViewChild('password') password!: ElementRef;
  @ViewChild('passwordRepeat') passwordRepeat!: ElementRef;

  registerSwitch = false;
  error?: string;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly blockUiService: BlockUiService
  ) {}

  loginEmailClick(): void {
    const email = this.email.nativeElement.value;
    const password = this.password.nativeElement.value;
    if (email === '' || password === '') {
      this.error = 'Vyplňtě prosím přihlašovací údaje';
      return;
    }
    const subscription: any = this.firebaseService
      .loginWithEmail(email, password)
      .pipe(this.blockUiService.blockPipe())
      .subscribe({
        next: () => subscription.unsubscribe(),
        error: (err) => {
          this.error = err.message;
          subscription.unsubscribe();
        },
      });
  }

  switchRegister(register: boolean): void {
    this.registerSwitch = register;
  }

  registerEmailClick(): void {
    const email = this.email.nativeElement.value;
    const password = this.password.nativeElement.value;
    const passwordRepeat = this.passwordRepeat.nativeElement.value;
    if (email === '' || password === '' || passwordRepeat === '') {
      this.error = 'Vyplňtě prosím registrační údaje';
      return;
    }
    if (password !== passwordRepeat) {
      this.error = 'Hesla se neshodují';
      return;
    }
    const subscription: any = this.firebaseService
      .registerWithEmail(email, password)
      .pipe(this.blockUiService.blockPipe())
      .subscribe({
        next: () => {
          subscription.unsubscribe();
          this.registerSwitch = false;
        },
        error: (err) => {
          this.error = err.message;
          subscription.unsubscribe();
        },
      });
  }

  loginGoogleClick(): void {
    const subscription = this.firebaseService
      .loginToGoogle()
      .pipe(this.blockUiService.blockPipe())
      .subscribe(() => subscription.unsubscribe());
  }

  loginFacebookClick(): void {
    const subscription = this.firebaseService
      .loginToFacebook()
      .pipe(this.blockUiService.blockPipe())
      .subscribe(() => subscription.unsubscribe());
  }
}
