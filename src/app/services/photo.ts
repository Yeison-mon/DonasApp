import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor() { }

  async takePhoto() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64, // Usamos Base64 para persistencia simple en Storage
      source: CameraSource.Camera,
      quality: 90
    });

    return `data:image/jpeg;base64,${capturedPhoto.base64String}`;
  }
}
