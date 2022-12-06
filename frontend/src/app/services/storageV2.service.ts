import { Injectable } from '@angular/core';
import { GpxModel } from '../shared/models/gpx.model';
import { FirebaseV2Service } from './firebaseV2.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { parse } from 'js2xmlparser';
import { mapToGpxExport } from '../shared/gpx.mapper';

export interface PointGroupInfo {
  id: string;
  uid?: string;
  name?: string;
  description?: string;
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

  private sharedPointGroups?: PointGroupInfo[];
  private sharedPointGroupsSubject = new BehaviorSubject<
    PointGroupInfo[] | null
  >(null);

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
          description: data[key].metadata.desc,
        });
      }
      this.pointGroups = pointGroupsTmp;
      this.pointGroupsSubject.next(pointGroupsTmp);
      this.loaded.next(true);
    });
    this.firebaseService.getSharedFiles().subscribe(async (data) => {
      const sharedFilesTmp = [];
      for (const sharedFile of data) {
        const loadedFile = await this.firebaseService.loadGPXFileData(
          sharedFile.id,
          sharedFile.uid
        );
        if (!loadedFile) {
          continue;
        }
        sharedFilesTmp.push({
          id: sharedFile.id,
          uid: sharedFile.uid,
          name: loadedFile.metadata.name,
          description: loadedFile.metadata.desc,
        });
      }
      this.sharedPointGroupsSubject.next(sharedFilesTmp);
      this.sharedPointGroups = sharedFilesTmp;
    });
  }

  getListOfFiles(): Observable<PointGroupInfo[] | null> {
    return this.pointGroupsSubject.asObservable();
  }

  getListOfSharedFiles(): Observable<PointGroupInfo[] | null> {
    return this.sharedPointGroupsSubject.asObservable();
  }

  waitUntilLoaded(): Promise<boolean> {
    if (this.loaded.getValue()) {
      return Promise.resolve(true);
    }
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
    let loadedFile = null;
    if (this.pointGroups?.find((pg) => pg.id === id)) {
      loadedFile = await this.firebaseService.loadGPXFileData(id);
    }
    const tmp = this.sharedPointGroups?.find((pg) => pg.id === id);
    if (tmp) {
      loadedFile = await this.firebaseService.loadGPXFileData(id, tmp.uid);
    }
    if (!loadedFile) {
      return Promise.resolve(null);
    }
    if (!loadedFile) {
      return null;
    }
    return {
      metadata: loadedFile.metadata,
      waypoints: loadedFile.waypoints ?? [],
      tracks: loadedFile.tracks ?? [],
      routes: loadedFile.routes ?? [],
      permissionData: loadedFile.permissionData ?? {},
    } as GpxModel;
  }

  async saveFile(id: string, data: GpxModel): Promise<void> {
    const tmp = this.sharedPointGroups?.find((pg) => pg.id === id);
    if (tmp) {
      this.firebaseService.saveGPXFileData(id, data, tmp.uid);
      return;
    }
    this.firebaseService.saveGPXFileData(id, data);
  }

  async exportToFile(id: string): Promise<void> {
    const file = await this.getFile(id);
    if (!file) {
      return;
    }
    const exportedFileString = parse('gpx', mapToGpxExport(file));
    const blob = new Blob([exportedFileString], {
      type: 'application/octet-stream',
    });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.download = file.metadata.name + '.gpx';
    anchor.href = url;
    anchor.click();
  }
}
