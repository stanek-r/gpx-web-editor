import { Component } from '@angular/core';
import gpxParser from 'gpxparser';
import { StorageService } from '../../../../services/storage.service';
import { GpxMetaData, GpxModel } from '../../../../shared/models/gpx.model';
import { nanoid } from 'nanoid';
import { mapToGpxMetadata, mapToGpxTrackOrRoute, mapToGpxWaypoint } from '../../../../shared/gpx.mapper';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  constructor(
    private readonly storageService: StorageService,
    private readonly dialogRef: MatDialogRef<UploadComponent>
  ) {}

  async onFileSelected(event: any): Promise<void> {
    if (event.target?.files.length > 0) {
      const file = event.target.files[0];
      const fileString = await this.readTextFile(file);
      if (fileString) {
        const gpxFileData = this.importFromFile(fileString);
        if (gpxFileData) {
          const id = nanoid(10);
          await this.storageService.saveFile(id, gpxFileData);
          this.dialogRef.close(id);
        }
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

  importFromFile(fileString: string): GpxModel | undefined {
    try {
      const gpx = new gpxParser();
      gpx.parse(fileString);

      const routes = gpx.routes.map((r) => mapToGpxTrackOrRoute(r));
      const tracks = gpx.tracks.map((t) => mapToGpxTrackOrRoute(t));

      return {
        permissionData: {},
        metadata: gpx.metadata
          ? mapToGpxMetadata(gpx.metadata)
          : ({
              name: 'Nový nahraný soubor',
              link: null,
              desc: null,
              time: new Date(),
              author: null,
            } as unknown as GpxMetaData),
        waypoints: gpx.waypoints.map((w) => mapToGpxWaypoint(w)),
        routes,
        tracks,
      };
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}
