import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GpxModel } from '../../../../shared/models/gpx.model';

export interface JoinData {
  type: 'routes' | 'tracks' | '';
  groupIndex1?: number;
  groupIndex2?: number;
}

@Component({
  selector: 'app-join-group-dialog',
  templateUrl: 'join-group-dialog.component.html',
})
export class JoinGroupDialogComponent {
  error?: string;

  fileToSplit?: GpxModel;
  joinData: JoinData = {
    type: '',
    groupIndex1: undefined,
    groupIndex2: undefined,
  };

  constructor(
    private readonly dialogRef: MatDialogRef<JoinGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      file?: GpxModel;
      type?: 'routes' | 'tracks';
      firstIndex?: number;
    }
  ) {
    if (!data?.file) {
      this.dialogRef.close(false);
      return;
    }
    if (data.file.routes.length < 2 && data.file.tracks.length < 2) {
      this.dialogRef.close(false);
      return;
    }
    if (data.type) {
      this.joinData.type = data.type;
    }
    if (data.firstIndex !== undefined) {
      this.joinData.groupIndex1 = data.firstIndex;
    }
    this.fileToSplit = data.file;
  }

  confirmClick(): void {
    if (this.joinData.type === '') {
      return;
    }
    if (this.joinData.groupIndex1 === undefined || this.joinData.groupIndex2 === undefined) {
      return;
    }
    if (this.joinData.groupIndex1 === this.joinData.groupIndex2) {
      return;
    }
    this.dialogRef.close({
      type: this.joinData.type,
      groupIndex1: +this.joinData.groupIndex1,
      groupIndex2: +this.joinData.groupIndex2,
    });
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
}
