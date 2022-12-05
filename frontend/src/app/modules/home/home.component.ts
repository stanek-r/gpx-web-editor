import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Observable } from 'rxjs';
import firebase from 'firebase';

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
