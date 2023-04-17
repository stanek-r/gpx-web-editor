import { Component } from '@angular/core';
import gpxParser from 'gpxparser';
import { GpxMetaData, GpxModel } from '../../../../shared/models/gpx.model';
import { mapToGpxMetadata, mapToGpxTrackOrRoute, mapToGpxWaypoint } from '../../../../shared/gpx.mapper';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  constructor(private readonly dialogRef: MatDialogRef<UploadComponent>) {}

  async onFileSelected(event: any): Promise<void> {
    if (event.target?.files.length > 0) {
      const file = event.target.files[0];
      const fileString = await this.readTextFile(file);
      if (fileString) {
        const gpxFileData = this.importFromFile(fileString);
        if (gpxFileData) {
          this.dialogRef.close(gpxFileData);
        }
      } else {
        this.dialogRef.close({
          error: true,
          text: 'Soubor nebylo možné přečíst',
        });
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

      const waypoints = gpx.waypoints?.map((w) => mapToGpxWaypoint(w)) ?? [];
      const routes = gpx.routes?.filter((r) => !!r).map((r) => mapToGpxTrackOrRoute(r)) ?? [];
      const tracks = gpx.tracks?.filter((r) => !!r).map((t) => mapToGpxTrackOrRoute(t)) ?? [];

      const hasMetadata: boolean = !!gpx.metadata && Object.keys(gpx.metadata).length > 0;

      return {
        permissionData: {},
        metadata: hasMetadata
          ? mapToGpxMetadata(gpx.metadata)
          : ({
              name: 'Nový nahraný soubor',
              link: null,
              desc: null,
              time: new Date(),
              author: null,
            } as unknown as GpxMetaData),
        waypoints,
        routes,
        tracks,
      };
    } catch (e) {
      console.error(e);
      this.dialogRef.close({
        error: true,
        text: e.toString(),
      });
      return undefined;
    }
  }
}
