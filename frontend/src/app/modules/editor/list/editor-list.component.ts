import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';
import { nanoid } from 'nanoid';
import { FirebaseService } from '../../../services/firebase.service';
// @ts-ignore
import createGpx from 'gps-to-gpx';

export interface PointGroup {
  id: string;
  points: google.maps.LatLngLiteral[];
}

@Component({
  selector: 'app-editor-list',
  templateUrl: './editor-list.component.html',
  styleUrls: ['./editor-list.component.scss'],
})
export class EditorListComponent implements OnInit {
  listOfPointGroups: PointGroup[] = [];
  fileUrl!: string;

  constructor(
    private readonly storageService: StorageService,
    private readonly firebaseService: FirebaseService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.firebaseService.getPointsMap().subscribe((pointGroups) => {
      this.listOfPointGroups = [];
      // tslint:disable-next-line:forin
      for (const pointGroupsKey in pointGroups) {
        this.listOfPointGroups.push({
          id: pointGroupsKey,
          points: pointGroups[pointGroupsKey],
        });
      }
    });
  }

  addNewGroup(): void {
    this.router.navigate(['/editor', nanoid(10)]);
  }

  removeGroup(id: string): void {
    this.storageService.removeGroup(id);
  }

  exportToFile(id: string): void {
    const gpx = createGpx(this.listOfPointGroups.find((pg) => pg.id === id)?.points.map((point) => ({ latitude: point.lat, longitude: point.lng, elevation: 0, time: '2016-07-06T12:36:00Z' })), {
      activityName: 'RUN',
      startTime: '2016-07-06T12:36:00Z',
    });
    const blob = new Blob([gpx], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.download = id + '.gpx';
    anchor.href = url;
    anchor.click();
  }
}
