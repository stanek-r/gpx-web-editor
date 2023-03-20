import { Component, Inject } from '@angular/core';
import { GpxModel } from '../../../../shared/models/gpx.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExportData } from '../split-file-dialog/split-file-dialog.component';
import { FileInfo, StorageService } from '../../../../services/storage.service';

export interface MoveData extends ExportData {
  fileToMoveTo: string;
}

@Component({
  selector: 'app-move-to-other-file-dialog',
  templateUrl: './move-to-other-file-dialog.component.html',
})
export class MoveToOtherFileDialogComponent {
  error?: string;

  fileToExtractFrom!: GpxModel;
  fileIdToExtractFrom!: string;
  files: FileInfo[] = [];

  exportData: MoveData = {
    fileToMoveTo: '',
    removeFromOld: false,
    waypoints: [],
    tracks: [],
    routes: [],
  };

  constructor(
    private readonly storageService: StorageService,
    private readonly dialogRef: MatDialogRef<MoveToOtherFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      file?: GpxModel;
      fileId?: string;
    }
  ) {
    if (!data?.file || !data?.fileId) {
      this.dialogRef.close(false);
      return;
    }
    this.fileToExtractFrom = data.file;
    this.fileIdToExtractFrom = data.fileId;

    this.exportData.waypoints.push(
      ...this.fileToExtractFrom.waypoints.map((w, index) => ({ index, isExported: false }))
    );
    this.exportData.tracks.push(...this.fileToExtractFrom.tracks.map((w, index) => ({ index, isExported: false })));
    this.exportData.routes.push(...this.fileToExtractFrom.routes.map((w, index) => ({ index, isExported: false })));

    const files = this.storageService.getListOfFilesValue();
    if (files) {
      this.files.push(...files.filter((f) => f.id !== this.fileIdToExtractFrom));
    }
    const sharedFiles = this.storageService.getListOfSharedFilesValue();
    if (sharedFiles) {
      this.files.push(...sharedFiles.filter((f) => f.id !== this.fileIdToExtractFrom));
    }
  }

  confirmClick(): void {
    if (!this.exportData.fileToMoveTo || this.exportData.fileToMoveTo.trim().length <= 0) {
      this.error = 'Musí být vybran soubor do kterého se mají elementy přesunout!';
      return;
    }
    const sumOfExportedFiles =
      this.exportData.waypoints.filter((w) => w.isExported).length +
      this.exportData.routes.filter((r) => r.isExported).length +
      this.exportData.tracks.filter((t) => t.isExported).length;
    if (sumOfExportedFiles <= 0) {
      this.error = 'Musí být vybrána alespoň jedna položka pro přesun!';
      return;
    }
    this.dialogRef.close(this.exportData);
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
}
