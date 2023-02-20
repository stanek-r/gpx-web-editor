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
    newFileName: '',
    waypoints: [],
    tracks: [],
    routes: [],
  };
  error?: string;

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
    if (this.splitData.newFileName.trim().length < 4) {
      this.error = 'Jméno nového souboru musí mít alespoň 4 znaky!';
      return;
    }
    const sumOfExportedFiles =
      this.splitData.waypoints.filter((w) => w.isExported).length +
      this.splitData.routes.filter((r) => r.isExported).length +
      this.splitData.tracks.filter((t) => t.isExported).length;
    if (sumOfExportedFiles <= 0) {
      this.error = 'Musí být vybrána alespoň jedna položka pro export!';
      return;
    }
    this.dialogRef.close(this.splitData);
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
}
