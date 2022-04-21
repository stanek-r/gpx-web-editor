import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ImageComponent } from './components/image/image.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ImageComponent, SideMenuComponent, LoginComponent],
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  exports: [ImageComponent, SideMenuComponent, LoginComponent],
})
export class SharedModule {}
