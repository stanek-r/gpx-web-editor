import { Injectable } from '@angular/core';
import { GpxModel } from '../shared/models/gpx.model';
import { FirebaseV2Service } from './firebaseV2.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PointGroupInfo {
  id: string;
  name?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StorageV2Service {
  private pointGroups?: PointGroupInfo[];
  private pointGroupsSubject = new BehaviorSubject<PointGroupInfo[] | null>(
    null
  );
  private loaded = new BehaviorSubject<boolean>(false);

  constructor(private readonly firebaseService: FirebaseV2Service) {
    this.firebaseService.getDBChangeEvent().subscribe((data) => {
      if (!data) {
        this.pointGroups = [];
        this.pointGroupsSubject.next([]);
        return;
      }
      const pointGroupsTmp: PointGroupInfo[] = [];
      for (const key of Object.keys(data)) {
        pointGroupsTmp.push({
          id: key,
          name: data[key].metadata.name,
        });
      }
      this.pointGroups = pointGroupsTmp;
      this.pointGroupsSubject.next(pointGroupsTmp);
      this.loaded.next(true);
    });
  }

  getListOfFiles(): Observable<PointGroupInfo[] | null> {
    return this.pointGroupsSubject.asObservable();
  }

  waitUntilLoaded(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const sub = this.loaded.subscribe((value) => {
        if (value) {
          resolve(true);
          sub.unsubscribe();
        }
      });
    });
  }

  removeFile(id: string): void {
    if (!this.pointGroups?.find((pg) => pg.id === id)) {
      return;
    }
    this.firebaseService.deleteGPXFileData(id);
  }

  async getFile(id: string): Promise<GpxModel | null> {
    if (!this.pointGroups?.find((pg) => pg.id === id)) {
      return Promise.resolve(null);
    }
    const loadedFile = await this.firebaseService.loadGPXFileData(id);
    if (!loadedFile) {
      return null;
    }
    return {
      metadata: loadedFile.metadata,
      waypoints: loadedFile.waypoints ?? [],
      tracks: loadedFile.tracks ?? [],
      routes: loadedFile.routes ?? [],
    } as GpxModel;
  }

  async saveFile(id: string, data: GpxModel): Promise<void> {
    this.firebaseService.saveGPXFileData(id, data);
  }
}
