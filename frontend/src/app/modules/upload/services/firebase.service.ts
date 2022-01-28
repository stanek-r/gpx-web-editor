import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, ReplaySubject } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;

export interface FileUpload {
  name: string;
  pathToFile: string;
  downloadUrl: any;
  userIP?: string;
}
export interface ChatMessage {
  message: string;
  userIP?: string;
}

@Injectable()
export class FirebaseService {
  private filesBasePath = '/files';
  private chatBasePath = '/chat';
  private ipAddress!: string;
  private uploadedFiles$ = new ReplaySubject<FileUpload[]>(1);
  private chatMessages$ = new ReplaySubject<ChatMessage[]>(1);
  private fireUser$ = new ReplaySubject<any>(1);

  constructor(
    private readonly fireAuth: AngularFireAuth,
    private readonly fireDB: AngularFireDatabase,
    private readonly fireStorage: AngularFireStorage,
    private readonly http: HttpClient
  ) {}

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

  pushMessageToDB(message: string): void {
    this.fireDB.list(this.chatBasePath).push({
      message,
      userIP: this.ipAddress,
    } as ChatMessage);
  }

  private saveFileData(fileUpload: FileUpload): void {
    this.fireDB.list(this.filesBasePath).push(fileUpload);
  }

  initializeFireBase(): void {
    this.getIPAddress();
    this.loadFilesFromDB();
    this.loadMessagesFromDB();
  }

  async loginToGoogle(): Promise<void> {
    this.fireAuth.signInWithPopup(new GoogleAuthProvider()).then((user) => {
      this.initializeFireBase();
      this.fireUser$.next(user);
    });
  }

  loadFilesFromDB(): void {
    this.fireDB
      .list(this.filesBasePath)
      .valueChanges()
      .subscribe((data: any) => {
        this.uploadedFiles$.next(data);
      });
  }

  loadMessagesFromDB(): void {
    this.fireDB
      .list(this.chatBasePath)
      .valueChanges()
      .subscribe((data: any[]) => {
        this.chatMessages$.next(data.reverse());
      });
  }

  getUploadedFiles(): Observable<FileUpload[]> {
    return this.uploadedFiles$;
  }

  getChatMessages(): Observable<ChatMessage[]> {
    return this.chatMessages$;
  }

  getFireUser(): Observable<any> {
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
