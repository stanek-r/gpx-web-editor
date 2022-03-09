import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { AgmDirectionModule } from 'agm-direction';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    SharedModule,
    RouterModule,
    AgmCoreModule.forRoot({
      apiKey: '',
    }),
    CommonModule,
    AgmDirectionModule,
  ],
  exports: [],
})
export class HomeModule {}
