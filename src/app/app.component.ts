import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  fireUser$!: Observable<any>;

  constructor(private readonly firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.fireUser$ = this.firebaseService.getFireUser();
  }
}
