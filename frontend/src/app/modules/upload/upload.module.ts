import { NgModule } from '@angular/core';
import { UploadComponent } from './components/upload/upload.component';
import { UploadRoutingModule } from './upload-routing.module';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [UploadComponent],
  imports: [
    UploadRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    FormsModule,
    CommonModule,
    SharedModule,
  ],
  providers: [FirebaseService],
  exports: [],
})
export class UploadModule {}
