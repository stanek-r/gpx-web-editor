import { NgModule } from '@angular/core';
import { UploadComponent } from './components/upload/upload.component';
import { UploadRoutingModule } from './upload-routing.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [UploadComponent],
  imports: [UploadRoutingModule, FormsModule, CommonModule, SharedModule],
  providers: [],
  exports: [],
})
export class UploadModule {}
