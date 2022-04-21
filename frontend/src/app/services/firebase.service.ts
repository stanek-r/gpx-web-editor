import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { from, Observable, ReplaySubject } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import { BlockUiService } from './block-ui.service';
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;

export interface FileUpload {
  name: string;
  pathToFile: string;
  downloadUrl: any;
  userIP?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private filesBasePath = '/files';
  private ipAddress!: string;
  private uploadedFiles$ = new ReplaySubject<FileUpload[]>(1);
  private fireUser$ = new ReplaySubject<firebase.User | null>(1);

  constructor(
    private readonly fireAuth: AngularFireAuth,
    private readonly fireDB: AngularFireDatabase,
    private readonly fireStorage: AngularFireStorage,
    private readonly http: HttpClient,
    private readonly blockUiService: BlockUiService
  ) {
    this.blockUiService.block();
    this.fireAuth.user.subscribe((user) => {
      this.fireUser$.next(user);
      this.blockUiService.unblockAll();
    });
  }

  pushFileToStorage(file: File): Observable<number | undefined> {
    const myUUID = uuidv4();
    const filePath = `${this.filesBasePath}/${myUUID}`;
    // const uploadTask = this.fireStorage.upload(filePath, file);
    const uploadTask = this.fireStorage.ref(filePath).put(file);
    uploadTask.then(async (data) => {
      this.saveFileData({
        name: file.name,
        pathToFile: filePath,
        downloadUrl: await data.ref.getDownloadURL(),
        userIP: this.ipAddress,
      });
    });
    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload): void {
    this.fireDB.list(this.filesBasePath).push(fileUpload);
  }

  initializeFireBase(): void {
    this.getIPAddress();
    this.loadFilesFromDB();
  }

  loginToGoogle(): Observable<any> {
    return from(this.fireAuth.signInWithPopup(new GoogleAuthProvider()));
  }

  loginToFacebook(): Observable<any> {
    return from(this.fireAuth.signInWithPopup(new FacebookAuthProvider()));
  }

  loginWithEmail(email: string, password: string): Observable<any> {
    return from(this.fireAuth.signInWithEmailAndPassword(email, password));
  }

  registerWithEmail(email: string, password: string): Observable<any> {
    return from(this.fireAuth.createUserWithEmailAndPassword(email, password));
  }

  logout(): void {
    this.fireAuth.signOut();
  }

  loadFilesFromDB(): void {
    this.fireDB
      .list(this.filesBasePath)
      .valueChanges()
      .subscribe((data: any) => {
        this.uploadedFiles$.next(data);
      });
  }

  getUploadedFiles(): Observable<FileUpload[]> {
    return this.uploadedFiles$;
  }

  getFireUser(): Observable<firebase.User | null> {
    return this.fireUser$;
  }

  private getIPAddress(): void {
    this.http
      .get('https://api.ipify.org/?format=json')
      .subscribe((res: any) => {
        this.ipAddress = res.ip;
      });
  }
}
