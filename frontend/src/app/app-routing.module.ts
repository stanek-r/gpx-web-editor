import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { UploadComponent } from './modules/upload/components/upload/upload.component';
import { MapComponent } from './modules/editor/map/map.component';
import { ListComponent } from './modules/editor/list/list.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'editor',
    component: ListComponent,
    pathMatch: 'full',
  },
  {
    path: 'editor/:id',
    component: MapComponent,
  },
  {
    path: 'upload',
    component: UploadComponent,
  },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
