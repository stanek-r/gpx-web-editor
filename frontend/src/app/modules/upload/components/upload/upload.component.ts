import { Component } from '@angular/core';
import gpxParser from 'gpxparser';
import { StorageV2Service } from '../../../../services/storageV2.service';
import { GpxModel } from '../../../../shared/models/gpx.model';
import { nanoid } from 'nanoid';
import {
  mapToGpxMetadata,
  mapToGpxTrackOrRoute,
  mapToGpxWaypoint,
} from '../../../../shared/gpx.mapper';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  constructor(
    private readonly storageService: StorageV2Service,
    private readonly dialogRef: MatDialogRef<UploadComponent>
  ) {}

  async onFileSelected(event: any): Promise<void> {
    if (event.target?.files.length > 0) {
      const file = event.target.files[0];
      const fileString = await this.readTextFile(file);
      if (fileString) {
        const gpxFileData = this.importFromFile(fileString);
        const id = nanoid(10);
        await this.storageService.saveFile(id, gpxFileData);
        this.dialogRef.close(id);
      }
    }
  }

  async readTextFile(file: any): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result?.toString().trim();
        resolve(text);
      };
      reader.readAsText(file);
    });
  }

  importFromFile(fileString: string): GpxModel {
    const gpx = new gpxParser();
    gpx.parse(fileString);

    const routes = gpx.routes.map((r) => mapToGpxTrackOrRoute(r));
    const tracks = gpx.tracks.map((t) => mapToGpxTrackOrRoute(t));

    return {
      metadata: mapToGpxMetadata(gpx.metadata),
      waypoints: gpx.waypoints.map((w) => mapToGpxWaypoint(w)),
      routes,
      tracks,
    };
  }
}
