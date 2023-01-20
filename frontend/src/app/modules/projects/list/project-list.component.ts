import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { Project } from '../../../shared/models/project.model';
import { nanoid } from 'nanoid';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  listOfProjects: Project[] = [];

  constructor(private readonly firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.fetchProjects();
  }

  fetchProjects(): void {
    this.listOfProjects = [];
    this.firebaseService
      .getProjects()
      .pipe(take(1))
      .subscribe((projects) => {
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
    this.fetchProjects();
  }

  async deleteProject(id: string): Promise<void> {
    await this.firebaseService.deleteProject(id);

    this.fetchProjects();
  }
}
