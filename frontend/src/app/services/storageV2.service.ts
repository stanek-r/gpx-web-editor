import {Injectable} from '@angular/core';
import {GpxModel} from '../shared/models/gpx.model';
import {FirebaseV2Service} from './firebaseV2.service';
import {BehaviorSubject, Observable} from 'rxjs';

export interface PointGroupInfo {
  id: string;
  name?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageV2Service {

  private pointGroups?: PointGroupInfo[];
  private pointGroupsSubject = new BehaviorSubject<PointGroupInfo[] | null>(null);

  constructor(
    private readonly firebaseService: FirebaseV2Service
  ) {

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
    });
  }

  getListOfFiles(): Observable<PointGroupInfo[] | null> {
    return this.pointGroupsSubject.asObservable();
  }

  removeFile(id: string): void {
    if (!this.pointGroups?.find(pg => pg.id === id)) {
      return;
    }
    this.firebaseService.deleteGPXFileData(id);
  }

  async getFile(id: string): Promise<GpxModel | null> {
    if (!this.pointGroups?.find(pg => pg.id === id)) {
      return Promise.resolve(null);
    }
    return this.firebaseService.loadGPXFileData(id);
  }

  async saveFile(id: string, data: GpxModel): Promise<void> {
    this.firebaseService.saveGPXFileData(id, data);
  }
}
