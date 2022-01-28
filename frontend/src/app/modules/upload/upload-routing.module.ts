import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';

const uploadRoutes: Routes = [
  {
    path: '',
    component: UploadComponent,
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'upload' },
];

@NgModule({
  imports: [RouterModule.forChild(uploadRoutes)],
  exports: [RouterModule],
})
export class UploadRoutingModule {}
