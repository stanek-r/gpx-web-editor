import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import {
  GpxModel,
  GpxPoint,
  GpxPointGroup,
  GpxWaypoint,
} from '../../../shared/models/gpx.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  // @ViewChild('indexSelect') indexSelect!: ElementRef<HTMLSelectElement>;

  lat: number | undefined;
  lng: number | undefined;
  readonly zoom = 9;

  backToDetail = false;
  backProject: string | null = null;

  // travelMode: TravelMode | undefined;
  id: string | null = null;
  fileData: GpxModel | null = null;

  changed = false;
  addPoint = false;
  selectedType: 'routes' | 'tracks' | 'waypoints' = 'waypoints';
  selectedIndex = 0;
  subSelectedIndex = 0;
  showPointInfo = false;

  // readonly markerOptions = {
  //   origin: {
  //     opacity: 1.0,
  //     draggable: false,
  //   },
  //   destination: {
  //     opacity: 1.0,
  //     draggable: false,
  //   },
  // };
  // readonly renderOptions = {
  //   suppressMarkers: true,
  // };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly storageService: StorageService,
    private readonly router: Router
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
    if (this.id && this.fileData) {
      await this.storageService.saveFile(this.id, this.fileData);
      this.changed = false;
    }
  }

  mapClick(event: any): void {
    if (!this.fileData) {
      return;
    }
    if (this.addPoint) {
      this.changed = true;

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

  addGroup(): void {
    if (!this.fileData) {
      return;
    }
    if (this.selectedType === 'waypoints') {
      return;
    }
    this.changed = true;
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
    this.changed = true;
    const index = this.selectedIndex;
    this.setIndex(0);
    this.fileData[this.selectedType].splice(index, 1);
  }

  removePoint(index: number): void {
    if (!this.fileData) {
      return;
    }
    this.changed = true;
    if (this.selectedType === 'waypoints') {
      this.fileData.waypoints.splice(index, 1);
      return;
    }
    this.fileData[this.selectedType][this.selectedIndex].points.splice(
      index,
      1
    );
  }

  waypointDrag(event: any, index: number): void {
    const point = this.fileData?.waypoints[index];
    if (point) {
      point.lat = event.coords.lat;
      point.lon = event.coords.lng;
      this.changed = true;
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
      this.changed = true;
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
      this.changed = true;
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

  trackPointClick(index1: number, index2: number): void {
    this.selectedType = 'tracks';
    this.setIndex(index1, index2);
    this.showPointInfo = true;
  }

  routePointClick(index1: number, index2: number): void {
    this.selectedType = 'routes';
    this.setIndex(index1, index2);
    this.showPointInfo = true;
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

  // selectType(type: 'routes' | 'tracks' | 'waypoints' = 'waypoints'): void {
  //   this.selectedIndex = 0;
  //   this.subSelectedIndex = 0;
  //   this.selectedType = type;
  // }

  // getIndexesToPrint(): number[] {
  //   if (!this.fileData) {
  //     return [];
  //   }
  //   if (this.selectedType === 'waypoints') {
  //     return [];
  //   }
  //   const ret = [];
  //   for (let i = 0; i < this.fileData[this.selectedType].length; i++) {
  //     ret.push(i);
  //   }
  //   return ret;
  // }
  //
  // getPointsToPrint(): GpxPoint[] {
  //   if (!this.fileData) {
  //     return [];
  //   }
  //   if (this.selectedType === 'waypoints') {
  //     return this.fileData.waypoints;
  //   }
  //   if (this.fileData[this.selectedType].length <= 0) {
  //     return [];
  //   }
  //   return this.fileData[this.selectedType][this.selectedIndex].points;
  // }

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

  // indexChange(event: any): void {
  //   this.selectedIndex = +event.target.value;
  //   this.subSelectedIndex = 0;
  // }

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
}
