import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectListComponent } from './list/project-list.component';
import { ProjectDetailComponent } from './detail/project-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [ProjectListComponent, ProjectDetailComponent],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatDividerModule,
  ],
  exports: [],
})
export class ProjectsModule {}
