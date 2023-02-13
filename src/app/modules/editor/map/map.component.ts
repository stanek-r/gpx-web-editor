import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import {
  GpxModel,
  GpxPoint,
  GpxPointGroup,
} from '../../../shared/models/gpx.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

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

  id: string | null = null;
  fileData: GpxModel | null = null;

  addPoint = false;
  selectedType: 'routes' | 'tracks' | 'waypoints' = 'waypoints';
  selectedIndex = 0;
  subSelectedIndex = 0;

  showPointInfo = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly storageService: StorageService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.paramMap.get('id');
    this.backToDetail = !!this.route.snapshot.queryParamMap.get('backToDetail');
    this.backProject = this.route.snapshot.queryParamMap.get('backProject');
    if (!this.id) {
      this.router.navigate(['/editor']);
      return;
    }
    await this.storageService.waitUntilLoaded();
    this.fileData = await this.storageService.getFile(this.id);
    if (!this.fileData) {
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
    if (this.id && this.fileData) {
      await this.storageService.saveFile(this.id, this.fileData);
    }
  }

  mapClick(event: any): void {
    if (!this.fileData) {
      return;
    }
    if (this.addPoint) {
      const lat = event.coords.lat;
      const lng = event.coords.lng;
      if (this.selectedType === 'waypoints') {
        this.fileData.waypoints.push({
          lat,
          lon: lng,
          time: new Date(),
          name: 'Test point ' + Math.round(Math.random() * 1000),
          ele: 0,
        });
      } else if (this.selectedType === 'routes') {
        this.fileData.routes[this.selectedIndex].points.push({
          lat,
          lon: lng,
          time: new Date(),
          ele: 0,
        });
      } else {
        this.fileData.tracks[this.selectedIndex].points.push({
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
    if (!this.fileData) {
      return;
    }
    if (this.selectedType === 'waypoints') {
      return;
    }
    this.fileData[this.selectedType].push({
      name: 'Test group' + Math.round(Math.random() * 1000),
      points: [],
      slopes: [],
    });
    this.setIndex(this.fileData[this.selectedType].length - 1);
  }

  RemoveGroup(): void {
    if (!this.fileData) {
      return;
    }
    if (this.selectedType === 'waypoints') {
      return;
    }
    const index = this.selectedIndex;
    this.setIndex(0);
    this.fileData[this.selectedType].splice(index, 1);
  }

  removePoint(index: number): void {
    if (!this.fileData) {
      return;
    }
    setTimeout(() => {
      this.dialog
        .open(ConfirmationDialogComponent, {
          width: '35%',
          data: { title: 'Smazat bod?', confirmButtonText: 'Smazat' },
        })
        .afterClosed()
        .subscribe((value) => {
          if (value && this.fileData) {
            if (this.selectedType === 'waypoints') {
              this.fileData.waypoints.splice(index, 1);
              return;
            }
            this.fileData[this.selectedType][this.selectedIndex].points.splice(
              index,
              1
            );
          }
        });
    }, 100);
  }

  waypointDrag(event: any, index: number): void {
    const point = this.fileData?.waypoints[index];
    if (point) {
      point.lat = event.coords.lat;
      point.lon = event.coords.lng;
    }
  }

  trackPointDrag(event: any, index1: number, index2: number): void {
    const point = this.fileData?.tracks[index1].points[index2];
    if (point) {
      // @ts-ignore
      this.fileData.tracks[index1].points[index2] = {
        ...point,
        lat: event.coords.lat,
        lon: event.coords.lng,
      };
    }
  }

  routePointDrag(event: any, index1: number, index2: number): void {
    const point = this.fileData?.routes[index1].points[index2];
    if (point) {
      // @ts-ignore
      this.fileData.routes[index1].points[index2] = {
        ...point,
        lat: event.coords.lat,
        lon: event.coords.lng,
      };
    }
  }

  setIndex(index: number, index2?: number): void {
    this.selectedIndex = index;
    this.subSelectedIndex = index2 !== undefined ? index2 : 0;
  }

  waypointClick(index: number): void {
    this.selectedType = 'waypoints';
    this.setIndex(index);
    this.showPointInfo = true;
  }

  waypointRightClick(index: number): void {
    this.waypointClick(index);
    this.showPointInfo = false;
    this.removePoint(index);
  }

  trackPointClick(index1: number, index2: number): void {
    this.selectedType = 'tracks';
    this.setIndex(index1, index2);
    this.showPointInfo = true;
  }

  trackPointRightClick(index1: number, index2: number): void {
    this.trackPointClick(index1, index2);
    this.showPointInfo = false;
    this.removePoint(this.subSelectedIndex);
  }

  routePointClick(index1: number, index2: number): void {
    this.selectedType = 'routes';
    this.setIndex(index1, index2);
    this.showPointInfo = true;
  }

  routePointRightClick(index1: number, index2: number): void {
    this.routePointClick(index1, index2);
    this.showPointInfo = false;
    this.removePoint(this.subSelectedIndex);
  }

  trackLineClick(index: number): void {
    this.selectedType = 'tracks';
    this.setIndex(index);
    this.showPointInfo = true;
  }

  routeLineClick(index: number): void {
    this.selectedType = 'routes';
    this.setIndex(index);
    this.showPointInfo = true;
  }

  loadDefaultMapPosition(): void {
    if (!this.fileData) {
      return;
    }
    const allPoints = [];
    for (const waypoint of this.fileData.waypoints) {
      allPoints.push(waypoint);
    }
    for (const route of this.fileData.routes) {
      for (const point of route.points) {
        allPoints.push(point);
      }
    }
    for (const track of this.fileData.routes) {
      for (const point of track.points) {
        allPoints.push(point);
      }
    }
    if (allPoints.length <= 0) {
      this.lat = 49.83815;
      this.lng = 18.2838842;
      return;
    }
    this.lat =
      allPoints
        .map((p) => p.lat)
        .reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          0
        ) / allPoints.length;
    this.lng =
      allPoints
        .map((p) => p.lon)
        .reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          0
        ) / allPoints.length;
  }

  getSelectedSection(): GpxPointGroup | undefined {
    if (!this.showPointInfo) {
      return undefined;
    }
    if (!this.fileData) {
      return undefined;
    }
    if (this.selectedType === 'waypoints') {
      return undefined;
    }
    return this.fileData[this.selectedType][this.selectedIndex];
  }

  getSelectedPoint(): GpxPoint | undefined {
    if (!this.showPointInfo) {
      return undefined;
    }
    if (!this.fileData) {
      return undefined;
    }
    if (this.selectedType === 'waypoints') {
      return this.fileData.waypoints[this.selectedIndex];
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
}
