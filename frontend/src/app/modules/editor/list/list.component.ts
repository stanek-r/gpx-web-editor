import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';

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
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const pointGroups = this.storageService.getAllPointsGroups();
    // tslint:disable-next-line:forin
    for (const pointGroupsKey in pointGroups) {
      this.listOfPointGroups.push({
        id: pointGroupsKey,
        points: pointGroups[pointGroupsKey],
      });
    }
  }

  addNewGroup(): void {
    let highestNumber = 0;
    for (const group of this.listOfPointGroups) {
      if (isNaN(+group.id)) {
        continue;
      }
      if (+group.id > highestNumber) {
        highestNumber = +group.id;
      }
    }
    this.router.navigate(['/editor', highestNumber + 1]);
  }

  removeGroup(id: string): void {
    this.listOfPointGroups = this.listOfPointGroups.filter(
      (group) => group.id !== id
    );
    this.storageService.removeGroup(id);
  }
}
