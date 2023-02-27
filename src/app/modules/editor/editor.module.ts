import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgmDirectionModule } from 'agm-direction';
import { AgmCoreModule } from '@agm/core';
import { MapComponent } from './map/map.component';
import { EditorListComponent } from './list/editor-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorDetailComponent } from './detail/editor-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { UploadModule } from '../upload/upload.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SplitFileDialogComponent } from './map/split-file-dialog/split-file-dialog.component';
import { JoinGroupDialogComponent } from './map/join-group-dialog/join-group-dialog.component';

@NgModule({
  declarations: [
    MapComponent,
    EditorListComponent,
    EditorDetailComponent,
    SplitFileDialogComponent,
    JoinGroupDialogComponent,
  ],
  imports: [
    SharedModule,
    RouterModule,
    CommonModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBlhKqQmeaoitPsrm293z_X19hTYJ8ckts',
    }),
    AgmDirectionModule,
    FormsModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDividerModule,
    UploadModule,
    MatDialogModule,
    MatSlideToggleModule,
  ],
  exports: [],
})
export class EditorModule {}
