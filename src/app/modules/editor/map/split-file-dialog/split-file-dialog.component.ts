import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GpxModel } from '../../../../shared/models/gpx.model';

export interface ExportInformation {
  index: number;
  isExported: boolean;
}

export interface ExportData {
  newFileName: string;
  waypoints: ExportInformation[];
  tracks: ExportInformation[];
  routes: ExportInformation[];
}

@Component({
  selector: 'app-split-file-dialog',
  templateUrl: 'split-file-dialog.component.html',
})
export class SplitFileDialogComponent {
  fileToSplit!: GpxModel;

  splitData: ExportData = {
    newFileName: 'Nový soubor',
    waypoints: [],
    tracks: [],
    routes: [],
  };

  constructor(
    private readonly dialogRef: MatDialogRef<SplitFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      file?: GpxModel;
    }
  ) {
    if (!data?.file) {
      this.dialogRef.close();
      return;
    }
    this.fileToSplit = data.file;

    this.splitData.waypoints.push(...this.fileToSplit.waypoints.map((w, index) => ({ index, isExported: false })));
    this.splitData.tracks.push(...this.fileToSplit.tracks.map((w, index) => ({ index, isExported: false })));
    this.splitData.routes.push(...this.fileToSplit.routes.map((w, index) => ({ index, isExported: false })));
  }

  confirmClick(): void {
    this.dialogRef.close(this.splitData);
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
}
