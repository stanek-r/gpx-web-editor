import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GpxModel } from '../../../../shared/models/gpx.model';

export interface AddPointData {
  type: 'waypoints' | 'routes' | 'tracks' | '';
  name?: '';
  groupIndex?: number;
  lon?: number;
  lat?: number;
}

@Component({
  selector: 'app-add-point-dialog',
  templateUrl: 'add-point-dialog.component.html',
})
export class AddPointDialogComponent {
  error?: string;

  file?: GpxModel;

  addPointData: AddPointData = {
    type: '',
    name: undefined,
    groupIndex: undefined,
    lon: undefined,
    lat: undefined,
  };

  constructor(
    private readonly dialogRef: MatDialogRef<AddPointDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      file?: GpxModel;
      type?: 'routes' | 'tracks' | 'waypoints';
      groupIndex?: number;
    }
  ) {
    if (!data?.file) {
      this.dialogRef.close(false);
      return;
    }
    this.file = data.file;
    if (data.type) {
      this.addPointData.type = data.type;
      if (data.type !== 'waypoints' && data.groupIndex !== undefined) {
        this.addPointData.groupIndex = data.groupIndex;
      }
    }
  }

  confirmClick(): void {
    if (this.addPointData.type === '') {
      this.error = 'Je potřeba vyplnit typ do které se má bod přidat';
      return;
    }
    if (this.addPointData.type !== 'waypoints' && this.addPointData.groupIndex === undefined) {
      this.error = 'Je potřeba vyplnit do jaké skupiny se má bod přidat';
      return;
    }
    if (this.addPointData.lat === undefined || this.addPointData.lon === undefined) {
      this.error = 'Je potřeba vyplnit Latitude i Longitude';
      return;
    }
    this.dialogRef.close({
      type: this.addPointData.type,
      groupIndex: this.addPointData.groupIndex !== undefined ? +this.addPointData.groupIndex : undefined,
      lon: +this.addPointData.lon,
      lat: +this.addPointData.lat,
      name: this.addPointData.name,
    });
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
}
