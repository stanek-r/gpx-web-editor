import { NgModule } from '@angular/core';
import { UploadComponent } from './components/upload/upload.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [UploadComponent],
  imports: [FormsModule, CommonModule, SharedModule],
  providers: [],
  exports: [],
})
export class UploadModule {}
