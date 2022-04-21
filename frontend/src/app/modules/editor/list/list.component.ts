import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';
import { nanoid } from 'nanoid';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  listOfPointGroups: {
    id: string;
    points: google.maps.LatLngLiteral[];
  }[] = [];

  constructor(
    private readonly storageService: StorageService,
    private readonly firebaseService: FirebaseService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.firebaseService.getPointsMap().subscribe((pointGroups) => {
      this.listOfPointGroups = [];
      // tslint:disable-next-line:forin
      for (const pointGroupsKey in pointGroups) {
        this.listOfPointGroups.push({
          id: pointGroupsKey,
          points: pointGroups[pointGroupsKey],
        });
      }
    });
  }

  addNewGroup(): void {
    this.router.navigate(['/editor', nanoid(10)]);
  }

  removeGroup(id: string): void {
    this.storageService.removeGroup(id);
  }
}
