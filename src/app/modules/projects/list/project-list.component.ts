import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { Project } from '../../../shared/models/project.model';
import { nanoid } from 'nanoid';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  listOfProjects: Project[] = [];

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchProjects();
  }

  fetchProjects(): void {
    this.listOfProjects = [];
    this.firebaseService
      .getProjects()
      .pipe(take(1))
      .subscribe((projects) => {
        if (!projects) {
          return;
        }
        for (const projectKey of Object.keys(projects)) {
          this.listOfProjects.push(projects[projectKey]);
        }
      });
  }

  async newProject(): Promise<void> {
    const id = nanoid(10);
    await this.firebaseService.saveProject(id, {
      id,
      name: 'Project ' + id,
      description: '',
      userIds: [],
      gpxFileIds: [],
    });
    this.router.navigate(['projects', id]);
  }

  async deleteProject(id: string): Promise<void> {
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: '35%',
        data: { title: 'Smazat projekt?', confirmButtonText: 'Smazat' },
      })
      .afterClosed()
      .subscribe(async (value) => {
        if (value) {
          await this.firebaseService.deleteProject(id);
          this.fetchProjects();
        }
      });
  }
}
