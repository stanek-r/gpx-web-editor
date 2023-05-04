import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from './services/firebase.service';
import firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  fireUser$!: Observable<firebase.User | null>;

  constructor(private readonly firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.fireUser$ = this.firebaseService.getFireUser();
  }

  logout(): void {
    this.firebaseService.logout();
  }

  reloadApplication(): void {
    window.location.reload();
  }

  resendEmailVerification(): void {
    this.firebaseService.resendEmailVerification();
  }
}
