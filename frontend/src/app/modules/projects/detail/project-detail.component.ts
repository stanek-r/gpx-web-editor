import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../list/project-list.component';
import { StorageService } from '../../../services/storage.service';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit {
  projectToShow?: Project;
  pointGroups?: any[];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly storageService: StorageService,
    private readonly firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((data) => {
      this.firebaseService.getProjects().subscribe((projects) => {
        this.projectToShow = projects[data.id];
        this.firebaseService.getPointsMap().subscribe((pointGroups) => {
          this.pointGroups = [];
          // tslint:disable-next-line:forin
          for (const pointGroupsKey in pointGroups) {
            if (this.projectToShow?.pointGroups.includes(pointGroupsKey)) {
              this.pointGroups.push({
                id: pointGroupsKey,
                points: pointGroups[pointGroupsKey],
              });
            }
          }
        });
      });
    });
  }
}
