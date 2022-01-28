import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ImageComponent } from './components/image/image.component';

@NgModule({
  declarations: [ImageComponent],
  imports: [RouterModule, CommonModule],
  exports: [ImageComponent],
})
export class SharedModule {}
