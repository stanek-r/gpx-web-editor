import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent {
  sideMenuExpanded = false;

  @Input() backUrl?: string;
  @Output() clickedBackEvent = new EventEmitter<void>();

  constructor(private readonly firebaseService: FirebaseService, private readonly router: Router) {}

  toggleSideMenu(): void {
    this.sideMenuExpanded = !this.sideMenuExpanded;
  }

  logout(): void {
    this.firebaseService.logout();
  }

  isActive(path?: string): boolean {
    let firstUrl = this.router.url.split('/')[0];
    if (!firstUrl) {
      firstUrl = this.router.url.split('/')[1];
    }
    if (!firstUrl && !path) {
      return true;
    }
    return firstUrl === path;
  }

  back(): void {
    this.clickedBackEvent.emit();
    this.router.navigate([this.backUrl]);
  }
}
