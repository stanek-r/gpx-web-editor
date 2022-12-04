import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  PointGroupInfo,
  StorageV2Service,
} from '../../../services/storageV2.service';

// @ts-ignore
import createGpx from 'gps-to-gpx';

@Component({
  selector: 'app-editor-list',
  templateUrl: './editor-list.component.html',
  styleUrls: ['./editor-list.component.scss'],
})
export class EditorListComponent implements OnInit {
  pointGroups$!: Observable<PointGroupInfo[] | null>;

  constructor(
    private readonly storageService: StorageV2Service,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.pointGroups$ = this.storageService.getListOfFiles();
  }

  addNewGroup(): void {
    // this.router.navigate(['/editor', nanoid(10)]);
  }

  removeGroup(id: string): void {
    this.storageService.removeFile(id);
  }

  async exportToFile(id: string): Promise<void> {
    const file = await this.storageService.getFile(id);
    if (!file) {
      return;
    }
    const gpx = createGpx(
      file.routes[0].points.map((point) => ({
        latitude: point.lat,
        longitude: point.lon,
        elevation: 0,
      })),
      {
        activityName: 'RUN',
        startTime: '2016-07-06T12:36:00Z',
      }
    );
    const blob = new Blob([gpx], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.download = id + '.gpx';
    anchor.href = url;
    anchor.click();
  }
}
