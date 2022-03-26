import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent {
  sideMenuExpanded = false;

  @Input() backUrl?: string;
  @Output() clickedBackEvent = new EventEmitter<void>();

  constructor(private readonly router: Router) {}

  toggleSideMenu(): void {
    this.sideMenuExpanded = !this.sideMenuExpanded;
  }

  back(): void {
    this.clickedBackEvent.emit();
    this.router.navigate([this.backUrl]);
  }
}
