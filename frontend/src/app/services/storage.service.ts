import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private pointsMap!: any;
  private isLoaded = false;

  constructor(private readonly firebaseService: FirebaseService) {
    this.firebaseService.loadUsersPointGroups().then(() => {
      this.isLoaded = true;
      this.firebaseService.getPointsMap().subscribe((pointMap) => {
        this.pointsMap = pointMap;
      });
    });
  }

  save(id: string, points: google.maps.LatLngLiteral[]): void {
    if (this.isLoaded) {
      this.pointsMap[id] = points;
      this.firebaseService.savePointGroup(id, points);
    }
  }

  async getPointsByGroupId(id: string): Promise<google.maps.LatLngLiteral[]> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (!this.isLoaded) {
          return;
        }
        const points = this.pointsMap[id];
        if (points) {
          clearInterval(interval);
          resolve(points);
        }
        clearInterval(interval);
        resolve([]);
      }, 100);
    });
  }

  removeGroup(id: string): void {
    delete this.pointsMap[id];
    this.firebaseService.deletePointGroup(id);
  }
}
