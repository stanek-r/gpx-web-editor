import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent {
  sideMenuExpanded = false;

  @Input() backUrl?: string;

  toggleSideMenu(): void {
    this.sideMenuExpanded = !this.sideMenuExpanded;
  }
}
