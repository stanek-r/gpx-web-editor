import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { HomeModule } from './modules/home/home.module';
import { UploadModule } from './modules/upload/upload.module';
import { EditorModule } from './modules/editor/editor.module';
import { SharedModule } from './shared/shared.module';
import { environment } from '../environments/environment';
import { BlockUiProviderComponent } from './shared/components/block-ui-provider/block-ui-provider.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectsModule } from './modules/projects/projects.module';
import { AngularFireModule } from '@angular/fire';

@NgModule({
  declarations: [AppComponent, BlockUiProviderComponent],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    HomeModule,
    EditorModule,
    ProjectsModule,
    UploadModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
