import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { UploadComponent } from './modules/upload/components/upload/upload.component';
import { MapComponent } from './modules/editor/map/map.component';
import { EditorListComponent } from './modules/editor/list/editor-list.component';
import { ProjectListComponent } from './modules/projects/list/project-list.component';
import { ProjectDetailComponent } from './modules/projects/detail/project-detail.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'projects',
    component: ProjectListComponent,
    pathMatch: 'full',
  },
  {
    path: 'projects/:id',
    component: ProjectDetailComponent,
  },
  {
    path: 'editor',
    component: EditorListComponent,
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
