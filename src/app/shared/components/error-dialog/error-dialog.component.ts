import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-error-dialog',
  templateUrl: 'error-dialog.component.html',
})
export class ErrorDialogComponent {
  title = 'Potvrdit akci?';
  subTitle = 'Pozor, tato akce je nevratná!';
  confirmButtonText = 'Potvrdit';

  constructor(
    private readonly dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      title?: string;
      subTitle?: string;
      confirmButtonText?: string;
    }
  ) {
    if (data) {
      if (data.title) {
        this.title = data.title;
      }
      if (data.subTitle) {
        this.subTitle = data.subTitle;
      }
      if (data.confirmButtonText) {
        this.confirmButtonText = data.confirmButtonText;
      }
    }
  }

  confirmClick(): void {
    this.dialogRef.close(true);
  }
}
