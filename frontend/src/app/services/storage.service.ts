import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private pointsMap!: any;
  private isLoaded = false;

  private _loadFromLocalStorage(): void {
    const storage = localStorage.getItem('gpx_points');
    if (storage) {
      this.pointsMap = JSON.parse(storage);
    } else {
      this.pointsMap = {};
    }
  }

  private _saveToLocalStorage(): void {
    localStorage.setItem('gpx_points', JSON.stringify(this.pointsMap));
  }

  save(id: string, points: google.maps.LatLngLiteral[]): void {
    this.pointsMap[id] = points;
    this._saveToLocalStorage();
  }

  getPointsByGroupId(id: string): google.maps.LatLngLiteral[] {
    if (!this.isLoaded) {
      this._loadFromLocalStorage();
    }
    const points = this.pointsMap[id];
    if (points) {
      return points;
    }
    return [];
  }

  getAllPointsGroups(): any {
    if (!this.isLoaded) {
      this._loadFromLocalStorage();
    }
    return this.pointsMap;
  }

  removeGroup(id: string): void {
    delete this.pointsMap[id];
    this._saveToLocalStorage();
  }
}
