import { Component, Inject } from '@angular/core';
import { GpxPoint, GpxPointGroup, GpxWaypoint } from '../../../../shared/models/gpx.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-element-metadata-dialog',
  templateUrl: './edit-element-metadata-dialog.component.html',
})
export class EditElementMetadataDialogComponent {
  error?: string;

  elementToEdit?: GpxWaypoint | GpxPointGroup | GpxPoint;
  type?: 'waypoints' | 'points' | 'routes' | 'tracks';

  constructor(
    private readonly dialogRef: MatDialogRef<EditElementMetadataDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      element?: GpxWaypoint | GpxPointGroup;
      type?: 'waypoints' | 'points' | 'routes' | 'tracks';
    }
  ) {
    if (!data?.type || !data?.element) {
      this.dialogRef.close(false);
      return;
    }
    this.elementToEdit = { ...data.element };
    this.type = data.type;
  }

  confirmClick(): void {
    this.dialogRef.close(this.elementToEdit);
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
}
