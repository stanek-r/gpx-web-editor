import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ImageComponent } from './components/image/image.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';

@NgModule({
  declarations: [ImageComponent, SideMenuComponent, LoginComponent, ConfirmationDialogComponent, ErrorDialogComponent],
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatDividerModule],
  exports: [ImageComponent, SideMenuComponent, LoginComponent],
})
export class SharedModule {}
