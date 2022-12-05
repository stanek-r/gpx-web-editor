import { Injectable } from '@angular/core';
import { GpxModel } from '../shared/models/gpx.model';
import { FirebaseV2Service } from './firebaseV2.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { parse } from 'js2xmlparser';
import { mapToGpxExport } from '../shared/gpx.mapper';

export interface PointGroupInfo {
  id: string;
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
  }

  getListOfFiles(): Observable<PointGroupInfo[] | null> {
    return this.pointGroupsSubject.asObservable();
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
