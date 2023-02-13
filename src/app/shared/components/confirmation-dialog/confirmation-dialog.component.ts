import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: 'confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  title = 'Potvrdit akci?';
  subTitle = 'Pozor, tato akce je nevratná!';
  confirmButtonText = 'Potvrdit';
  cancelButtonText = 'Zrušit';

  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      title?: string;
      subTitle?: string;
      confirmButtonText?: string;
      cancelButtonText?: string;
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
      if (data.cancelButtonText) {
        this.cancelButtonText = data.cancelButtonText;
      }
    }
  }

  confirmClick(): void {
    this.dialogRef.close(true);
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
}
