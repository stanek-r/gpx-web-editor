import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { GpxModel, GpxPoint, GpxPointGroup } from '../../../shared/models/gpx.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  lat: number | undefined;
  lng: number | undefined;
  readonly zoom = 9;

  backToDetail = false;
  backProject: string | null = null;

  ids: string[] = [];
  files: GpxModel[] = [];

  addPoint = false;

  selectedFile = 0;
  selectedType: 'routes' | 'tracks' | 'waypoints' = 'waypoints';
  selectedIndex = 0;
  subSelectedIndex = 0;

  showPointInfo = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly storageService: StorageService,
    private readonly firebaseService: FirebaseService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    this.backToDetail = !!this.route.snapshot.queryParamMap.get('backToDetail');
    this.backProject = this.route.snapshot.queryParamMap.get('backProject');

    await this.storageService.waitUntilLoaded();

    const singleId = this.route.snapshot.paramMap.get('id');
    if (singleId) {
      this.ids.push(singleId);
      await this.loadFiles();
      return;
    }

    const projectId = this.route.snapshot.paramMap.get('projectId');
    if (projectId) {
      this.backProject = projectId;
      this.firebaseService.getProject(projectId).subscribe(async (project) => {
        if (!project) {
          this.router.navigate(['/projects']);
          return;
        }
        this.ids.push(...project.gpxFileIds);
        await this.loadFiles();
      });
      return;
    }
    this.router.navigate(['/editor']);
  }

  async loadFiles(): Promise<void> {
    if (this.ids.length <= 0) {
      this.router.navigate(['/editor']);
      return;
    }
    const idsToRemove: string[] = [];
    for (const id of this.ids) {
      const file = await this.storageService.getFile(id);
      if (file) {
        this.files.push(file);
      } else {
        idsToRemove.push(id);
      }
    }
    this.ids = this.ids.filter((id) => !idsToRemove.includes(id));
    if (this.files.length <= 0) {
      this.router.navigate(['/editor']);
      return;
    }
    this.loadDefaultMapPosition();
  }
  async ngOnDestroy(): Promise<void> {
    await this.save();
  }

  async save(): Promise<void> {
    this.addPoint = false;
    for (let i = 0; i < this.ids.length; i++) {
      await this.storageService.saveFile(this.ids[i], this.files[i]);
    }
  }

  mapClick(event: any): void {
    const file = this.files[this.selectedFile];

    if (this.addPoint) {
      const lat = event.coords.lat;
      const lng = event.coords.lng;
      if (this.selectedType === 'waypoints') {
        file.waypoints.push({
          lat,
          lon: lng,
          time: new Date(),
          name: 'Test point ' + Math.round(Math.random() * 1000),
          ele: 0,
        });
      } else if (this.selectedType === 'routes') {
        file.routes[this.selectedIndex].points.push({
          lat,
          lon: lng,
          time: new Date(),
          ele: 0,
        });
      } else {
        file.tracks[this.selectedIndex].points.push({
          lat,
          lon: lng,
          time: new Date(),
          ele: 0,
        });
      }
    } else {
      this.showPointInfo = false;
    }
  }

  mapRightClick(): void {
    this.toggleAddingOfPoints();
  }

  addGroup(): void {
    const file = this.files[this.selectedFile];

    if (this.selectedType === 'waypoints') {
      return;
    }
    file[this.selectedType].push({
      name: 'Test group' + Math.round(Math.random() * 1000),
      points: [],
      slopes: [],
    });
    this.setIndex(this.selectedFile, file[this.selectedType].length - 1);
  }

  RemoveGroup(): void {
    const file = this.files[this.selectedFile];

    if (this.selectedType === 'waypoints') {
      return;
    }
    const index = this.selectedIndex;
    this.setIndex(this.selectedFile, 0);
    file[this.selectedType].splice(index, 1);
  }

  removePoint(index: number): void {
    const file = this.files[this.selectedFile];

    setTimeout(() => {
      this.dialog
        .open(ConfirmationDialogComponent, {
          width: '35%',
          data: { title: 'Smazat bod?', confirmButtonText: 'Smazat' },
        })
        .afterClosed()
        .subscribe((value) => {
          if (value) {
            if (this.selectedType === 'waypoints') {
              file.waypoints.splice(index, 1);
              return;
            }
            file[this.selectedType][this.selectedIndex].points.splice(index, 1);
          }
        });
    }, 100);
  }

  waypointDrag(event: any, fileIndex: number, index: number): void {
    const file = this.files[this.selectedFile];

    const point = file.waypoints[index];
    if (point) {
      point.lat = event.coords.lat;
      point.lon = event.coords.lng;
    }
  }

  trackPointDrag(event: any, fileIndex: number, index1: number, index2: number): void {
    const file = this.files[this.selectedFile];

    const point = file.tracks[index1].points[index2];
    if (point) {
      file.tracks[index1].points[index2] = {
        ...point,
        lat: event.coords.lat,
        lon: event.coords.lng,
      };
    }
  }

  routePointDrag(event: any, fileIndex: number, index1: number, index2: number): void {
    const file = this.files[this.selectedFile];

    const point = file.routes[index1].points[index2];
    if (point) {
      file.routes[index1].points[index2] = {
        ...point,
        lat: event.coords.lat,
        lon: event.coords.lng,
      };
    }
  }

  setIndex(fileIndex: number, index: number, index2?: number): void {
    this.selectedFile = fileIndex;
    this.selectedIndex = index;
    this.subSelectedIndex = index2 !== undefined ? index2 : 0;
  }

  waypointClick(fileIndex: number, index: number): void {
    this.selectedType = 'waypoints';
    this.setIndex(fileIndex, index);
    this.showPointInfo = true;
  }

  waypointRightClick(fileIndex: number, index: number): void {
    this.waypointClick(fileIndex, index);
    this.showPointInfo = false;
    this.removePoint(index);
  }

  trackPointClick(fileIndex: number, index1: number, index2: number): void {
    this.selectedType = 'tracks';
    this.setIndex(fileIndex, index1, index2);
    this.showPointInfo = true;
  }

  trackPointRightClick(fileIndex: number, index1: number, index2: number): void {
    this.trackPointClick(fileIndex, index1, index2);
    this.showPointInfo = false;
    this.removePoint(this.subSelectedIndex);
  }

  routePointClick(fileIndex: number, index1: number, index2: number): void {
    this.selectedType = 'routes';
    this.setIndex(fileIndex, index1, index2);
    this.showPointInfo = true;
  }

  routePointRightClick(fileIndex: number, index1: number, index2: number): void {
    this.routePointClick(fileIndex, index1, index2);
    this.showPointInfo = false;
    this.removePoint(this.subSelectedIndex);
  }

  trackLineClick(fileIndex: number, index: number): void {
    this.selectedType = 'tracks';
    this.setIndex(fileIndex, index);
    this.showPointInfo = true;
  }

  routeLineClick(fileIndex: number, index: number): void {
    this.selectedType = 'routes';
    this.setIndex(fileIndex, index);
    this.showPointInfo = true;
  }

  loadDefaultMapPosition(): void {
    const allPoints = [];
    for (const file of this.files) {
      for (const waypoint of file.waypoints) {
        allPoints.push(waypoint);
      }
      for (const route of file.routes) {
        for (const point of route.points) {
          allPoints.push(point);
        }
      }
      for (const track of file.routes) {
        for (const point of track.points) {
          allPoints.push(point);
        }
      }
    }
    if (allPoints.length <= 0) {
      this.lat = 49.83815;
      this.lng = 18.2838842;
      return;
    }
    this.lat =
      allPoints.map((p) => p.lat).reduce((previousValue, currentValue) => previousValue + currentValue, 0) /
      allPoints.length;
    this.lng =
      allPoints.map((p) => p.lon).reduce((previousValue, currentValue) => previousValue + currentValue, 0) /
      allPoints.length;
  }

  getSelectedSection(): GpxPointGroup | undefined {
    if (!this.showPointInfo) {
      return undefined;
    }
    if (this.selectedType === 'waypoints') {
      return undefined;
    }
    const file = this.files[this.selectedFile];
    return file[this.selectedType][this.selectedIndex];
  }

  getSelectedPoint(): GpxPoint | undefined {
    if (!this.showPointInfo) {
      return undefined;
    }
    const file = this.files[this.selectedFile];
    if (this.selectedType === 'waypoints') {
      return file.waypoints[this.selectedIndex];
    }
    const selectedSection = this.getSelectedSection();
    if (!selectedSection) {
      return undefined;
    }
    return selectedSection.points[this.subSelectedIndex];
  }

  toggleAddingOfPoints(): void {
    this.addPoint = !this.addPoint;
  }

  getBackUrl(): string {
    if (this.backToDetail) {
      return '/editor/' + this.ids[0];
    }
    if (this.backProject) {
      return '/projects/' + this.backProject;
    }
    return '/editor';
  }
}
