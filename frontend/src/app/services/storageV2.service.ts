import {Injectable} from '@angular/core';
import {GpxModel} from '../shared/models/gpx.model';
import {FirebaseV2Service} from './firebaseV2.service';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StorageV2Service {

  private pointGroups?: string[];

  constructor(
    private readonly firebaseService: FirebaseV2Service,
    private readonly http: HttpClient
  ) {
    this.firebaseService.getDBChangeEvent().subscribe((data) => {
      console.log(data);
    });
  }

  async getFile(id: string): Promise<GpxModel | null> {
    if (!this.pointGroups?.includes(id)) {
      return Promise.resolve(null);
    }
    return this.firebaseService.loadGPXFileData(id);
  }

  async saveFile(id: string, data: GpxModel): Promise<void> {
    this.firebaseService.saveGPXFileData(id, data);
  }
}
