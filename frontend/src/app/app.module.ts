import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { HomeModule } from './modules/home/home.module';
import { UploadModule } from './modules/upload/upload.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HomeModule,
    UploadModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
