import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ImageComponent } from './components/image/image.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';

@NgModule({
  declarations: [ImageComponent, SideMenuComponent],
  imports: [RouterModule, CommonModule],
  exports: [ImageComponent, SideMenuComponent],
})
export class SharedModule {}
