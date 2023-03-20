import { Injectable } from '@angular/core';
import { GpxModel } from '../shared/models/gpx.model';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { parse } from 'js2xmlparser';
import { mapToGpxExport } from '../shared/gpx.mapper';
import { Project } from '../shared/models/project.model';

export interface FileInfo {
  id: string;
  uid?: string;
  name?: string;
  description?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private filesSubject = new BehaviorSubject<FileInfo[] | null>(null);

  private sharedFilesSubject = new BehaviorSubject<FileInfo[] | null>(null);

  private loaded = new BehaviorSubject<boolean>(false);

  constructor(private readonly firebaseService: FirebaseService) {
    this.firebaseService.getOwnedFilesChanges().subscribe((data) => {
      if (!data) {
        this.filesSubject.next([]);
        this.loaded.next(true);
        return;
      }
      const pointGroupsTmp: FileInfo[] = [];
      for (const key of Object.keys(data)) {
        pointGroupsTmp.push({
          id: key,
          name: data[key].metadata.name,
          description: data[key].metadata.desc,
        });
      }
      this.filesSubject.next(pointGroupsTmp);
      this.loaded.next(true);
    });
    this.firebaseService.getSharedFilesChanges().subscribe(async (data) => {
      const sharedFilesTmp = [];
      for (const sharedFile of data) {
        const loadedFile = await this.firebaseService.loadGPXFileData(sharedFile.id, sharedFile.uid);
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
      this.sharedFilesSubject.next(sharedFilesTmp);
    });
  }

  getListOfFiles(): Observable<FileInfo[] | null> {
    return this.filesSubject.asObservable();
  }

  getListOfFilesValue(): FileInfo[] | null {
    return this.filesSubject.getValue();
  }

  getListOfSharedFiles(): Observable<FileInfo[] | null> {
    return this.sharedFilesSubject.asObservable();
  }

  getListOfSharedFilesValue(): FileInfo[] | null {
    return this.sharedFilesSubject.getValue();
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
    if (!this.filesSubject.getValue()?.find((pg) => pg.id === id)) {
      return;
    }
    this.firebaseService.deleteGPXFileData(id);
  }

  async getFile(id: string): Promise<GpxModel | null> {
    let loadedFile = null;
    if (this.filesSubject.getValue()?.find((pg) => pg.id === id)) {
      loadedFile = await this.firebaseService.loadGPXFileData(id);
    }
    const tmp = this.sharedFilesSubject.getValue()?.find((pg) => pg.id === id);
    if (tmp) {
      loadedFile = await this.firebaseService.loadGPXFileData(id, tmp.uid);
    }
    if (!loadedFile) {
      return null;
    }
    return {
      metadata: loadedFile.metadata,
      waypoints: loadedFile.waypoints ?? [],
      tracks: loadedFile.tracks?.map((t) => ({ ...t, points: t.points ?? [], slopes: t.slopes ?? [] })) ?? [],
      routes: loadedFile.routes?.map((t) => ({ ...t, points: t.points ?? [], slopes: t.slopes ?? [] })) ?? [],
      permissionData: loadedFile.permissionData ?? {},
    } as GpxModel;
  }

  isOwner(id: string): boolean {
    return !!this.filesSubject.getValue()?.find((pg) => pg.id === id);
  }

  async saveFile(id: string, data: GpxModel): Promise<void> {
    const tmp = this.sharedFilesSubject.getValue()?.find((pg) => pg.id === id);
    if (tmp) {
      return this.firebaseService.saveGPXFileData(id, data, tmp.uid);
    }
    await this.firebaseService.saveGPXFileData(id, data);
  }

  downloadFile(file: GpxModel): void {
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

  async exportToFile(id: string): Promise<void> {
    const file = await this.getFile(id);
    if (!file) {
      return;
    }
    this.downloadFile(file);
  }

  async exportProjectToFile(project: Project): Promise<void> {
    const files: GpxModel[] = [];
    for (const id of project.gpxFileIds) {
      const file = await this.getFile(id);
      if (file) {
        files.push(file);
      }
    }
    if (files.length > 0) {
      let combinedFile = files[0];
      for (let i = 1; i < files.length; i++) {
        combinedFile = this.combineFiles(combinedFile, files[i]);
      }
      combinedFile.metadata.name = project.name;
      combinedFile.metadata.desc = project.description;
      this.downloadFile(combinedFile);
    }
  }

  combineFiles(file1: GpxModel, file2: GpxModel): GpxModel {
    return {
      metadata: {
        ...file2.metadata,
        ...file1.metadata,
      },
      routes: [...file1.routes, ...file2.routes],
      tracks: [...file1.tracks, ...file2.tracks],
      waypoints: [...file1.waypoints, ...file2.waypoints],
      permissionData: {},
    };
  }
}
