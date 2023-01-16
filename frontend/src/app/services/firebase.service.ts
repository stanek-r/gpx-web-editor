import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { HttpClient } from '@angular/common/http';
import { BlockUiService } from './block-ui.service';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import firebase from 'firebase';
import { map, switchMap, tap } from 'rxjs/operators';
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import { GpxModel } from '../shared/models/gpx.model';
import User = firebase.User;

export interface SharedFileInfo {
  uid: string;
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private fireBaseDatabaseUrl =
    'https://gpx-web-editor-default-rtdb.europe-west1.firebasedatabase.app';
  private filesBasePath = '/gpxfiles';
  private sharesBasePath = '/sharing';
  private projectsBasePath = '/project';

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

  async saveGPXFileData(
    id: string,
    data: GpxModel,
    uid?: string
  ): Promise<void> {
    const user = this.fireUserSubject.getValue();
    if (!user) {
      return;
    }
    this.setFileSharing(id, Object.keys(data.permissionData ?? {}));
    return this.fireDB
      .list(this.filesBasePath + '/' + (uid ?? user.uid))
      .set(id, data);
  }

  deleteGPXFileData(id: string): void {
    const user = this.fireUserSubject.getValue();
    if (!user) {
      return;
    }
    this.fireDB.list(this.filesBasePath + '/' + user?.uid).remove(id);
  }

  setFileSharing(fileToShare: string, withWho: string[]): void {
    const user = this.fireUserSubject.getValue();
    if (!user) {
      return;
    }
    this.fireDB
      .list(this.sharesBasePath + '/' + user.uid)
      .set(fileToShare, withWho);
  }

  async loadGPXFileData(id: string, uid?: string): Promise<GpxModel | null> {
    const user = this.fireUserSubject.getValue();
    if (!user) {
      return Promise.resolve(null);
    }
    const token = await user.getIdToken();
    if (!token) {
      return Promise.resolve(null);
    }
    return new Promise<GpxModel | null>((resolve) => {
      this.http
        .get(
          `${this.fireBaseDatabaseUrl + this.filesBasePath}/${
            uid ?? user.uid
          }/${id}.json?auth=${token}`
        )
        .subscribe({
          next: (data) => {
            resolve(data as GpxModel);
          },
          error: () => resolve(null),
        });
    });
  }

  getOwnedFiles(): Observable<any> {
    return this.fireUserSubject.pipe(
      switchMap((value) => {
        if (!value) {
          return of(null);
        }
        return this.fireDB
          .list(`${this.filesBasePath}/${this.fireUserSubject.getValue()?.uid}`)
          .valueChanges()
          .pipe(
            switchMap(() => {
              const user = this.fireUserSubject.getValue();
              if (!user) {
                return of(null);
              }
              return from(user.getIdToken()).pipe(
                switchMap((token) => {
                  if (!token) {
                    return of(null);
                  }
                  return this.http.get<any>(
                    `${this.fireBaseDatabaseUrl + this.filesBasePath}/${
                      user.uid
                    }.json?auth=${token}`
                  );
                })
              );
            })
          );
      })
    );
  }

  getSharedFiles(): Observable<SharedFileInfo[]> {
    return this.fireUserSubject.pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }
        return this.fireDB
          .list(`${this.sharesBasePath}`)
          .valueChanges()
          .pipe(
            switchMap(() => {
              return from(user.getIdToken()).pipe(
                switchMap((token) => {
                  if (!token) {
                    return of([]);
                  }
                  return this.http
                    .get<any>(
                      `${
                        this.fireBaseDatabaseUrl + this.sharesBasePath
                      }.json?auth=${token}`
                    )
                    .pipe(
                      map((value) => {
                        const ret: SharedFileInfo[] = [];
                        for (const key of Object.keys(value)) {
                          // @ts-ignore
                          for (const key2 of Object.keys(value[key])) {
                            // @ts-ignore
                            if (
                              (value[key][key2] as any[]).includes(user.uid)
                            ) {
                              ret.push({
                                uid: key,
                                id: key2,
                              });
                            }
                          }
                        }
                        return ret;
                      })
                    );
                })
              );
            })
          );
      })
    );
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
