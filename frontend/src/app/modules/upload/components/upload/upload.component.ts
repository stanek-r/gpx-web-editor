import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FileUpload, FirebaseService } from '../../services/firebase.service';
import firebase from 'firebase';
import User = firebase.User;

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit {
  uploading$?: Observable<number | undefined>;
  files$?: Observable<FileUpload[]>;
  user$?: Observable<User>;

  chatInput = '';

  constructor(private readonly firebaseService: FirebaseService) {}

  async ngOnInit(): Promise<void> {
    this.files$ = this.firebaseService.getUploadedFiles();
    this.user$ = this.firebaseService.getFireUser();
  }

  onFileSelected(event: any): void {
    if (event.target?.files.length > 0) {
      const file = event.target.files[0];
      this.uploading$ = this.firebaseService.pushFileToStorage(file);
    }
  }

  async loginViaGoogle(): Promise<void> {
    await this.firebaseService.loginToGoogle();
  }
}
