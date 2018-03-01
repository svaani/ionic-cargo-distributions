import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { SignatureComponent } from '../signature/signature.component';
import { Camera, CameraOptions} from '@ionic-native/camera';
import { File, FileEntry } from "@ionic-native/file";
import { LoadingController, Loading, ToastController } from "ionic-angular";
import { AuthService } from '../../app/auth.service';
import { HomeComponent } from '../home/home.component';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { NativeStorage } from '@ionic-native/native-storage';
import { FileUploader } from 'ng2-file-upload';
import * as domtoimage from 'dom-to-image';

@Component({
  selector: 'app-map',
  templateUrl: './pod.component.html',
  styleUrls: []
})
export class PodComponent implements AfterViewInit {
  @ViewChild("signatureImage22") signatureImageFile: any;
  public signatureImage : any;
  public pickupRequestVehicleTripId : any ;
  public myPhoto: any;
  public myPhotoURL: any;
  public error: string;
  private loading: Loading;
  hasTripStarted = false;

  constructor(
    public navCtrl: NavController,
    public navParams:NavParams,
    public modalController:ModalController,
    private camera : Camera,
    private readonly loadingCtrl: LoadingController,
    private readonly file: File,
    private http: HttpClient,
    private auth: AuthService, 
    private nativeStorage: NativeStorage,
    public uploader : FileUploader
    )

    { 
    this.signatureImage = navParams.get('signatureImage');
    this.pickupRequestVehicleTripId = navParams.get('pickupRequestVehicleTripId');
    }

    ngAfterViewInit() {
    this.uploader = new FileUploader({
      url: this.auth.getRemoteUrl() + '/cargo/api/create_proofOfDelivery',
      authToken : this.auth.getToken()
      //headers : [{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},{"Authorization": this.auth.getToken()}]
    });
    this.uploader.onBuildItemForm = (item, form) => {
      let userId = this.auth.getUserId();

      form.append("proofOfDeliveryInput", JSON.stringify({
        pickup_request_vehicle_trip_id: this.pickupRequestVehicleTripId,
        delivered_to_person: 'newperson',
        user_id: "13",
        delivered_date: new Date().toISOString().split("T")[0].split("-").join('/'),
        delivered_time: new Date().toTimeString().split(":").splice(0, 2).join(":"),
        comment: '',
        "podSignature":{"$ngfBlobUrl":"blob:http://35.154.80.6:8080/677d000c-c4cc-4313-aae7-f311522bab2a"}
      }));
    }; 
  //   this.nativeStorage.getItem('pickupRequestTripId')
  //  .then(
  //  data => {this.pickupRequestVehicleTripId = data
  // } ,
  //  error => console.log(error)
  //  ); 
  }


   getFormUrlEncoded(toConvert) {
    const formBody = [];
    for (const property in toConvert) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(toConvert[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    return formBody.join('&');
  }

  openSignatureModel(){
    setTimeout(() => {
       let modal = this.modalController.create(SignatureComponent,{pickupRequestVehicleTripId:this.pickupRequestVehicleTripId});
    modal.present();
    }, 300);
  
  }
 takePhoto() {
  this.camera.getPicture({
    quality: 100,
    destinationType: this.camera.DestinationType.FILE_URI,
    sourceType: this.camera.PictureSourceType.CAMERA,
    encodingType: this.camera.EncodingType.PNG,
    saveToPhotoAlbum: true
  }).then(imageData => {
   
    // this.myPhoto = imageData;
    this.displayImage(imageData);
    // this.uploadPhoto(imageData);
  }, error => {
    console.log(JSON.stringify(error));
    
  });
}



private uploadPhoto(imageFileUri: any): void {

 /* this.error = null;
  this.loading = this.loadingCtrl.create({
    content: 'Uploading...'
  });

  this.loading.present();

  this.file.resolveLocalFilesystemUrl(imageFileUri)
    .then(entry => (<FileEntry>entry).file(file => this.readFile(file)))
    .catch(err => console.log(err));*/
}



// private readFile(file: any) {
//   const reader = new FileReader();
//   reader.onloadend = () => {
//     const formData = new FormData();
//     const imgBlob = new Blob([reader.result], {type: file.type});
//     console.log(imgBlob);
//    // formData.append('file', imgBlob, file.name);
//     // this.postData(formData);
//   };
//   reader.readAsArrayBuffer(file);
// }

private displayImage(imgUri) {
  this.myPhoto = "data:image/jpeg;base64," + imgUri;;
  console.log(this.myPhoto);
}


pod(){
  if(this.signatureImage){
    let node = document.getElementById('signImage');
    domtoimage.toBlob(node)
        .then((blob) => {
          blob['name'] = 'signatureImage.jpg';
            this.uploader.addToQueue([blob]);
            this.uploader.getNotUploadedItems()[0].alias = "signatureImage";
            this.uploader.uploadAll();
    });
    
  }

//   console.log(this.pickupRequestVehicleTripId);

//  let str =
// {
//   proofOfDeliveryInput: JSON.stringify({
//     pickup_request_vehicle_trip_id: this.pickupRequestVehicleTripId,
//     delivered_to_person: 'xyz',
//     user_id: "13",
//     delivered_date: new Date().toISOString().split("T")[0].split("-").join('/'),
//     delivered_time: new Date().toTimeString().split(":").splice(0,2).join(":"),
//     comment: ''
//   }),
//   signatureImage : this.signatureImage,
//   photoImage : this.myPhoto 
// }

// this.http.post(this.auth.getRemoteUrl() + '/cargo/api/create_proofOfDelivery', this.getFormUrlEncoded(str),{headers : this.auth.getRequestHeaders()}).subscribe((data) => {
// console.log(data);
this.hasTripStarted = !this.hasTripStarted;
if (this.hasTripStarted) {
  alert("Proof of Delivery Created!"); 
  this.navCtrl.push(HomeComponent);
}
else {
  alert("Error in creating Proof of Delivery");
}
// });
}

cancel(){
  this.navCtrl.push(HomeComponent);
}

}
