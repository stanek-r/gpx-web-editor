import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileStorageService } from '../../../services/file-storage.service';
import { GpxModel, GpxPoint, GpxPointGroup, GpxWaypoint } from '../../../shared/models/gpx.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { FirebaseService } from '../../../services/firebase.service';
import { SplitData, SplitFileDialogComponent } from './split-file-dialog/split-file-dialog.component';
import { nanoid } from 'nanoid';
import { Project } from '../../../shared/models/project.model';
import { JoinData, JoinGroupDialogComponent } from './join-group-dialog/join-group-dialog.component';
import { AddPointData, AddPointDialogComponent } from './add-point-dialog/add-point-dialog.component';
import {
  MoveData,
  MoveToOtherFileDialogComponent,
} from './mode-to-other-file-dialog/move-to-other-file-dialog.component';
import { EditElementMetadataDialogComponent } from './edit-element-metadata-dialog/edit-element-metadata-dialog.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  lat: number | undefined;
  lng: number | undefined;
  zoom: number | undefined;

  backToDetail = false;
  backProject: string | null = null;
  project: Project | null = null;

  ids: string[] = [];
  files: GpxModel[] = [];

  addPoint = false;
  editTracks = false;
  editRoutes = false;

  selectedFile = 0;
  selectedType: 'routes' | 'tracks' | 'waypoints' = 'waypoints';
  selectedIndex = 0;
  subSelectedIndex = 0;

  showPointInfo = false;

  changed = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly storageService: FileStorageService,
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
        this.project = project;
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
    if (this.changed) {
      this.dialog
        .open(ConfirmationDialogComponent, {
          minWidth: '50%',
          data: { title: 'Uložit změny před zavřením?', confirmButtonText: 'Uložit', cancelButtonText: 'Neukládat' },
        })
        .afterClosed()
        .subscribe(async (value) => {
          if (value) {
            await this.save();
          }
        });
    }
  }

  async save(): Promise<void> {
    this.addPoint = false;
    for (let i = 0; i < this.ids.length; i++) {
      await this.storageService.saveFile(this.ids[i], this.files[i]);
    }
    if (this.project && this.project.gpxFileIds.length !== this.ids.length) {
      await this.firebaseService.saveProject(this.project.id, {
        ...this.project,
        gpxFileIds: this.ids,
      });
    }
    this.changed = false;
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
          name: 'Bod zájmu',
          ele: 0,
        });
        this.changed = true;
      } else {
        if (this.files[this.selectedFile][this.selectedType].length <= this.selectedIndex) {
          this.addGroup();
        }
        if (this.selectedType === 'routes') {
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
        this.changed = true;
      }
    } else {
      this.showPointInfo = false;
    }
  }

  mapRightClick(): void {
    this.toggleAddingOfPoints();
  }

  canAddPointManually(): boolean {
    if (this.selectedType === 'waypoints') {
      return true;
    }
    const groups = this.files[this.selectedFile][this.selectedType];
    if (groups.length > 0) {
      return true;
    }
    return false;
  }

  addPointManually(): void {
    this.dialog
      .open(AddPointDialogComponent, {
        minWidth: '50%',
        data: {
          file: this.files[this.selectedFile],
          type: this.selectedType,
          groupIndex: this.selectedIndex,
        },
      })
      .afterClosed()
      .subscribe(async (value: AddPointData | false) => {
        if (!value || value.lon === undefined || value.lat === undefined) {
          return;
        }
        const file = this.files[this.selectedFile];
        const newPoint: GpxPoint = {
          lat: value.lat,
          lon: value.lon,
          ele: 0,
          time: new Date(),
        };
        if (value.type === 'waypoints') {
          const newWaypoint: GpxWaypoint = {
            ...newPoint,
            name: value.name ?? 'Bod zájmu',
          };
          file.waypoints.push(newWaypoint);
          this.changed = true;
          return;
        }
        file[value.type][value.groupIndex].points.push(newPoint);
        this.changed = true;
      });
  }

  addGroup(): void {
    const file = this.files[this.selectedFile];

    if (this.selectedType === 'waypoints') {
      return;
    }
    file[this.selectedType].push({
      name: 'New ' + this.selectedType.substring(0, this.selectedType.length - 1),
      points: [],
      slopes: [],
    });
    this.setIndex(this.selectedFile, file[this.selectedType].length - 1);
    this.changed = true;
  }

  removeGroup(displayTitle: string): void {
    const file = this.files[this.selectedFile];
    if (this.selectedType === 'waypoints') {
      return;
    }
    this.dialog
      .open(ConfirmationDialogComponent, {
        minWidth: '35%',
        data: { title: displayTitle, confirmButtonText: 'Smazat' },
      })
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          const index = this.selectedIndex;
          this.setIndex(this.selectedFile, 0);
          file[this.selectedType].splice(index, 1);
          this.changed = true;
        }
      });
  }

  removePoint(index: number): void {
    const file = this.files[this.selectedFile];

    setTimeout(() => {
      this.dialog
        .open(ConfirmationDialogComponent, {
          minWidth: '35%',
          data: { title: 'Smazat bod?', confirmButtonText: 'Smazat' },
        })
        .afterClosed()
        .subscribe((value) => {
          if (value) {
            if (this.selectedType === 'waypoints') {
              file.waypoints.splice(index, 1);
              this.changed = true;
              return;
            }
            file[this.selectedType][this.selectedIndex].points.splice(index, 1);
            this.changed = true;
          }
        });
    }, 100);
  }

  editElement(editPointInGroup: boolean): void {
    const type = editPointInGroup ? 'points' : this.selectedType;
    let element: GpxWaypoint | GpxPointGroup | GpxPoint;
    if (type !== 'points') {
      element = this.files[this.selectedFile][this.selectedType][this.selectedIndex];
    } else {
      element = (this.files[this.selectedFile][this.selectedType][this.selectedIndex] as GpxPointGroup).points[
        this.subSelectedIndex
      ];
    }

    if (!element) {
      return;
    }

    this.dialog
      .open(EditElementMetadataDialogComponent, {
        minWidth: '50%',
        data: { element, type },
      })
      .afterClosed()
      .subscribe((value) => {
        if (!value) {
          return;
        }
        if (type !== 'points') {
          this.files[this.selectedFile][this.selectedType][this.selectedIndex] = value;
        } else {
          (this.files[this.selectedFile][this.selectedType][this.selectedIndex] as GpxPointGroup).points[
            this.subSelectedIndex
          ] = value;
        }
        this.changed = true;
      });
  }

  waypointDrag(event: any, fileIndex: number, index: number): void {
    const file = this.files[fileIndex];

    const point = file.waypoints[index];
    if (point) {
      point.lat = event.coords.lat;
      point.lon = event.coords.lng;
      this.changed = true;
    }
  }

  trackPointDrag(event: any, fileIndex: number, index1: number, index2: number): void {
    const file = this.files[fileIndex];

    const point = file.tracks[index1].points[index2];
    if (point) {
      file.tracks[index1].points[index2] = {
        ...point,
        lat: event.coords.lat,
        lon: event.coords.lng,
      };
      this.changed = true;
    }
  }

  routePointDrag(event: any, fileIndex: number, index1: number, index2: number): void {
    const file = this.files[fileIndex];

    const point = file.routes[index1].points[index2];
    if (point) {
      file.routes[index1].points[index2] = {
        ...point,
        lat: event.coords.lat,
        lon: event.coords.lng,
      };
      this.changed = true;
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
    if (allPoints.length === 0) {
      this.lat = 49.83815;
      this.lng = 18.2838842;
      this.zoom = 10;
      return;
    }
    if (allPoints.length === 1) {
      this.lat = allPoints[0].lat;
      this.lng = allPoints[0].lon;
      this.zoom = 10;
      return;
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    allPoints.forEach((point) => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLng = Math.min(minLng, point.lon);
      maxLng = Math.max(maxLng, point.lon);
    });

    this.lat = (minLat + maxLat) / 2;
    this.lng = (minLng + maxLng) / 2;

    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    this.zoom = Math.floor(8 - Math.log(maxDiff) / Math.log(2));
  }

  isSelected(type: 'routes' | 'tracks' | 'waypoints', fileIndex: number, index1: number, index2?: number): boolean {
    if (!this.showPointInfo) {
      return false;
    }
    if (this.selectedFile !== fileIndex) {
      return false;
    }
    if (this.selectedType !== type) {
      return false;
    }
    if (this.selectedIndex !== index1) {
      return false;
    }
    if (index2 !== undefined && this.subSelectedIndex !== index2) {
      return false;
    }
    return true;
  }

  showJoinPointGroupButton(): boolean {
    if (this.selectedType === 'waypoints') {
      return false;
    }
    const pointGroups = this.files[this.selectedFile][this.selectedType];
    if (!pointGroups) {
      return false;
    }
    return pointGroups.length > 1;
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

  moveElements(): void {
    this.dialog
      .open(MoveToOtherFileDialogComponent, {
        minWidth: '50%',
        data: { file: this.files[this.selectedFile], fileId: this.ids[this.selectedFile] },
      })
      .afterClosed()
      .subscribe(async (value: MoveData | undefined) => {
        if (!value) {
          return;
        }
        const file = this.files[this.selectedFile];
        const fileToMoveTo = await this.storageService.getFile(value.fileToMoveTo);
        if (!fileToMoveTo) {
          return;
        }

        const waypointsToExport: GpxWaypoint[] = [];
        const waypointsToRemove: number[] = [];
        for (const waypointExport of value.waypoints) {
          if (waypointExport.isExported) {
            waypointsToExport.push(file.waypoints[waypointExport.index]);
            waypointsToRemove.push(waypointExport.index);
          }
        }

        const tracksToExport: GpxPointGroup[] = [];
        const tracksToRemove: number[] = [];
        for (const trackExport of value.tracks) {
          if (trackExport.isExported) {
            tracksToExport.push(file.tracks[trackExport.index]);
            tracksToRemove.push(trackExport.index);
          }
        }

        const routesToExport: GpxPointGroup[] = [];
        const routesToRemove: number[] = [];
        for (const routeExport of value.routes) {
          if (routeExport.isExported) {
            routesToExport.push(file.routes[routeExport.index]);
            routesToRemove.push(routeExport.index);
          }
        }
        if (value.removeFromOld) {
          file.waypoints = file.waypoints.filter((_, index) => !waypointsToRemove.includes(index));
          file.tracks = file.tracks.filter((_, index) => !tracksToRemove.includes(index));
          file.routes = file.routes.filter((_, index) => !routesToRemove.includes(index));
          this.changed = true;
        }

        const updatedFile = {
          ...fileToMoveTo,
          routes: [...fileToMoveTo.routes, ...routesToExport],
          tracks: [...fileToMoveTo.tracks, ...tracksToExport],
          waypoints: [...fileToMoveTo.waypoints, ...waypointsToExport],
        } as unknown as GpxModel;

        if (value.removeFromOld) {
          await this.save();
        }
        await this.storageService.saveFile(value.fileToMoveTo, updatedFile);
        if (this.project) {
          const index = this.ids.findIndex((id) => id === value.fileToMoveTo);
          if (index !== -1) {
            this.selectedFile = index;
            return;
          }
          await this.router.navigate(['/editor/', value.fileToMoveTo]);
          return;
        }
        await this.router.navigate(['/editor/map/', value.fileToMoveTo], { queryParams: { backToDetail: true } });
        this.ids[0] = value.fileToMoveTo;
        this.files[0] = updatedFile;
      });
  }

  splitFile(): void {
    this.dialog
      .open(SplitFileDialogComponent, {
        minWidth: '50%',
        data: { file: this.files[this.selectedFile], isFromProject: !!this.project },
      })
      .afterClosed()
      .subscribe(async (value: SplitData | undefined) => {
        if (!value) {
          return;
        }
        const file = this.files[this.selectedFile];

        const waypointsToExport: GpxWaypoint[] = [];
        const waypointsToRemove: number[] = [];
        for (const waypointExport of value.waypoints) {
          if (waypointExport.isExported) {
            waypointsToExport.push(file.waypoints[waypointExport.index]);
            waypointsToRemove.push(waypointExport.index);
          }
        }

        const tracksToExport: GpxPointGroup[] = [];
        const tracksToRemove: number[] = [];
        for (const trackExport of value.tracks) {
          if (trackExport.isExported) {
            tracksToExport.push(file.tracks[trackExport.index]);
            tracksToRemove.push(trackExport.index);
          }
        }

        const routesToExport: GpxPointGroup[] = [];
        const routesToRemove: number[] = [];
        for (const routeExport of value.routes) {
          if (routeExport.isExported) {
            routesToExport.push(file.routes[routeExport.index]);
            routesToRemove.push(routeExport.index);
          }
        }

        const newFileId = nanoid(10);
        const newFile = {
          permissionData: {},
          metadata: {
            name: value.newFileName,
            link: null,
            desc: null,
            time: new Date(),
            author: null,
          },
          routes: routesToExport,
          tracks: tracksToExport,
          waypoints: waypointsToExport,
        } as unknown as GpxModel;

        if (value.removeFromOld) {
          file.waypoints = file.waypoints.filter((_, index) => !waypointsToRemove.includes(index));
          file.tracks = file.tracks.filter((_, index) => !tracksToRemove.includes(index));
          file.routes = file.routes.filter((_, index) => !routesToRemove.includes(index));
          this.changed = true;
        }
        if (this.project) {
          this.ids.push(newFileId);
          this.files.push(newFile);
          this.changed = true;
          return;
        }

        if (value.removeFromOld) {
          await this.save();
        }
        await this.storageService.saveFile(newFileId, newFile);
        await this.router.navigate(['/editor/map/', newFileId], { queryParams: { backToDetail: true } });
        this.ids[0] = newFileId;
        this.files[0] = newFile;
      });
  }

  joinPointGroups(): void {
    this.dialog
      .open(JoinGroupDialogComponent, {
        minWidth: '50%',
        data: {
          file: this.files[this.selectedFile],
          type: this.selectedType,
          firstIndex: this.selectedIndex,
        },
      })
      .afterClosed()
      .subscribe(async (value: JoinData | false) => {
        if (!value) {
          return;
        }
        const file = this.files[this.selectedFile];
        const group1 = file[value.type][value.groupIndex1];
        const group2 = file[value.type][value.groupIndex2];
        if (!group1 || !group2) {
          return;
        }
        const newGroup: GpxPointGroup = {
          ...group1,
          points: [...group1.points, ...group2.points],
        };

        file[value.type] = file[value.type].filter(
          (_: GpxPointGroup, index: number) => index !== value.groupIndex1 && index !== value.groupIndex2
        );
        file[value.type].push(newGroup);
        this.changed = true;
      });
  }
}
