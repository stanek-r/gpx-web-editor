import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireDatabase} from '@angular/fire/database';
import {HttpClient} from '@angular/common/http';
import {BlockUiService} from './block-ui.service';
import {BehaviorSubject, from, Observable, of} from 'rxjs';
import firebase from 'firebase';
import {filter, switchMap, take, tap} from 'rxjs/operators';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import {GpxModel} from '../shared/models/gpx.model';
import User = firebase.User;

@Injectable({
  providedIn: 'root'
})
export class FirebaseV2Service {

  private fireBaseDatabaseUrl =
    'https://gpx-web-editor-default-rtdb.europe-west1.firebasedatabase.app';
  private filesBasePath = '/gpx-files';

  private fireUserSubject = new BehaviorSubject<User | null>(null);

  constructor(
    private readonly fireAuth: AngularFireAuth,
    private readonly fireDB: AngularFireDatabase,
    private readonly http: HttpClient,
    private readonly blockUiService: BlockUiService
  ) {
    this.blockUiService.block();
    this.fireAuth.user.subscribe(async (user) => {
      this.fireUserSubject.next(user);
      this.blockUiService.unblockAll();
    });
  }

  saveGPXFileData(id: string, data: GpxModel): void {
    const user = this.fireUserSubject.getValue();
    if (!user) {
      return;
    }
    this.fireDB.list(this.filesBasePath + '/' + user.uid).set(id, data);
  }

  deleteGPXFileData(id: string): void {
    const user = this.fireUserSubject.getValue();
    if (!user) {
      return;
    }
    this.fireDB.list(this.filesBasePath + '/' + user?.uid).remove(id);
  }

  async loadGPXFileData(id: string): Promise<GpxModel | null> {
    const user = this.fireUserSubject.getValue();
    if (!user) {
      return Promise.resolve(null);
    }
    const token = await user.getIdToken();
    if (!token) {
      return Promise.resolve(null);
    }
    return new Promise<GpxModel | null>((resolve, reject) => {
      this.http
        .get(
          `${this.fireBaseDatabaseUrl + this.filesBasePath}/${user.uid}/${id}.json?auth=${token}`
        )
        .subscribe({
          next: (data) => {
            resolve(data as GpxModel);
          },
          error: () => resolve(null)
        });
    });
  }

  getDBChangeEvent(): Observable<any> {
    return this.fireUserSubject.pipe(switchMap((value) => {
      if (!value) {
        return of(null);
      }
      return this.fireDB
        .list(`${this.filesBasePath}/${this.fireUserSubject.getValue()?.uid}`)
        .valueChanges()
        .pipe(switchMap(() => {
          const user = this.fireUserSubject.getValue();
          if (!user) {
            return of(null);
          }
          return from(user.getIdToken()).pipe(switchMap((token) => {
            if (!token) {
              return of(null);
            }
            return this.http.get<any>(
              `${this.fireBaseDatabaseUrl + this.filesBasePath}/${user.uid}.json?auth=${token}`
            );
          }));
        }));
    }));
  }

  getFireUser(): Observable<User | null> {
    return this.fireUserSubject.asObservable();
  }

  getFireUserValue(): User | null {
    return this.fireUserSubject.getValue();
  }

  loginToGoogle(): Observable<any> {
    return from(this.fireAuth.signInWithPopup(new GoogleAuthProvider()));
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

}
