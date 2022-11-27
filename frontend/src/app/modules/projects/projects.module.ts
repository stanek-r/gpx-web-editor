import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectListComponent } from './list/project-list.component';
import { ProjectDetailComponent } from './detail/project-detail.component';

@NgModule({
  declarations: [ProjectListComponent, ProjectDetailComponent],
  imports: [CommonModule, RouterModule, SharedModule],
  exports: [],
})
export class ProjectsModule {}
