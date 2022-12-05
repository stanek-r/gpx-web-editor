import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgmDirectionModule } from 'agm-direction';
import { AgmCoreModule } from '@agm/core';
import { MapComponent } from './map/map.component';
import { EditorListComponent } from './list/editor-list.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MapComponent, EditorListComponent],
  imports: [
    SharedModule,
    RouterModule,
    CommonModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBlhKqQmeaoitPsrm293z_X19hTYJ8ckts',
    }),
    AgmDirectionModule,
    FormsModule,
  ],
  exports: [],
})
export class EditorModule {}
