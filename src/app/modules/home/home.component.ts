import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from '../../services/firebase.service';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  fireUser$!: Observable<firebase.User | null>;

  constructor(private readonly firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.fireUser$ = this.firebaseService.getFireUser();
  }
}
