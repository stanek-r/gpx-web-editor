import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, from, Observable, ReplaySubject } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import { BlockUiService } from './block-ui.service';
import FacebookAuthProvider = firebase.auth.FacebookAuthProvider;
import { take, tap } from 'rxjs/operators';
import { Project } from '../modules/projects/list/project-list.component';

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
  private fireBaseDatabaseUrl =
    'https://gpx-web-editor-default-rtdb.europe-west1.firebasedatabase.app';
  private filesBasePath = '/files';
  private groupsBasePath = '/groups';
  private projectsBasePath = '/projects';

  private fireUser$ = new ReplaySubject<firebase.User | null>(1);
  private fireUser: firebase.User | null = null;

  private pointsMap$ = new BehaviorSubject<any>({});
  private projects$ = new BehaviorSubject<any>({});
  private files$ = new BehaviorSubject<any>([]);

  constructor(
    private readonly fireAuth: AngularFireAuth,
    private readonly fireDB: AngularFireDatabase,
    private readonly fireStorage: AngularFireStorage,
    private readonly http: HttpClient,
    private readonly blockUiService: BlockUiService
  ) {
    this.blockUiService.block();
    this.fireAuth.user.subscribe(async (user) => {
      this.fireUser$.next(user);
      this.fireUser = user;
      this.blockUiService.unblockAll();
    });
  }

  getFireUser(): Observable<firebase.User | null> {
    return this.fireUser$;
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
    return from(
      this.fireAuth.createUserWithEmailAndPassword(email, password)
    ).pipe(
      tap((credentials) => {
        if (credentials?.user && !credentials.user.emailVerified) {
          credentials.user.sendEmailVerification();
        }
      })
    );
  }

  logout(): void {
    this.fireAuth.signOut();
  }

  savePointGroup(id: string, pointArray: any): void {
    this.fireUser$.pipe(take(1)).subscribe((user) => {
      this.fireDB
        .list(this.groupsBasePath + '/' + user?.uid)
        .set(id, pointArray);
    });
  }

  saveProject(project: Project): void {
    this.fireUser$.pipe(take(1)).subscribe((user) => {
      this.fireDB
        .list(this.projectsBasePath + '/' + user?.uid)
        .set(project.id, project);
    });
  }

  deleteProject(id: string): void {
    this.fireUser$.pipe(take(1)).subscribe((user) => {
      this.fireDB.list(this.projectsBasePath + '/' + user?.uid).remove(id);
    });
  }

  deletePointGroup(id: string): void {
    this.fireUser$.pipe(take(1)).subscribe((user) => {
      this.fireDB.list(this.groupsBasePath + '/' + user?.uid).remove(id);
    });
  }

  loadUsersPointGroups(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fireDB
        .list(this.groupsBasePath + '/' + this.fireUser?.uid)
        .valueChanges()
        .subscribe(async () => {
          const token = await this.fireUser?.getIdToken();
          this.http
            .get(
              `${this.fireBaseDatabaseUrl + this.groupsBasePath}/${
                this.fireUser?.uid
              }.json?auth=${token}`
            )
            .subscribe((data) => {
              this.pointsMap$.next(data ?? {});
              resolve();
            });
        });
      this.fireDB
        .list(this.projectsBasePath + '/' + this.fireUser?.uid)
        .valueChanges()
        .subscribe(async () => {
          const token = await this.fireUser?.getIdToken();
          this.http
            .get(
              `${this.fireBaseDatabaseUrl + this.projectsBasePath}/${
                this.fireUser?.uid
              }.json?auth=${token}`
            )
            .subscribe((data) => {
              this.projects$.next(data ?? {});
              resolve();
            });
        });
      // this.fireDB
      //   .list(this.filesBasePath + '/' + this.fireUser?.uid)
      //   .valueChanges()
      //   .subscribe(async () => {
      //     const token = await this.fireUser?.getIdToken();
      //     this.http
      //       .get(
      //         `${this.fireBaseDatabaseUrl + this.filesBasePath}/${
      //           this.fireUser?.uid
      //         }.json?auth=${token}`
      //       )
      //       .subscribe((data) => {
      //         this.files$.next(Object.values(data));
      //         resolve();
      //       });
      //   });
    });
  }

  getPointsMap(): Observable<any> {
    return this.pointsMap$;
  }

  getProjects(): Observable<any> {
    return this.projects$;
  }

  getFiles(): Observable<any[]> {
    return this.files$;
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
      });
    });
    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload): void {
    this.fireUser$.pipe(take(1)).subscribe((user) => {
      this.fireDB.list(this.filesBasePath + '/' + user?.uid).push(fileUpload);
    });
  }
}
