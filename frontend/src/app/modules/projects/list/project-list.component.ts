import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { StorageService } from '../../../services/storage.service';

export interface Project {
  id: string;
  name: string;
  pointGroups: string[];
  users: any[];
}

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  listOfProjects: Project[] = [];

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.firebaseService.getProjects().subscribe((projects) => {
      this.listOfProjects = [];
      // tslint:disable-next-line:forin
      for (const projectKey in projects) {
        this.listOfProjects.push(projects[projectKey]);
      }
    });
  }

  newProject(): void {
    this.firebaseService.saveProject({
      id: '321',
      name: 'Test project',
      users: [],
      pointGroups: ['HD9SuOIFzb', 'rLNpd6JZq3'],
    });
  }

  removeProject(id: string): void {
    this.firebaseService.deleteProject(id);
  }
}
