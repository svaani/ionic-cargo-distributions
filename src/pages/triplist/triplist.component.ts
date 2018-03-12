import { Component, ViewChild, ElementRef, OnInit, Output,EventEmitter } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../app/auth.service';
import { NavController ,AlertController } from 'ionic-angular';
import { SkulistComponent } from '../skulist/skulist.component';
import { PodComponent } from '../pod/pod.component';
import { NativeStorage } from '@ionic-native/native-storage';

@Component({
  selector: 'triplist',
  templateUrl: './triplist.component.html',
  styleUrls: []
})

export class TriplistComponent implements OnInit {
  @Output() triplistdata  = new EventEmitter<string>();
  @Output() vehicledata  = new EventEmitter();
  
  tripName: string = "";
  tripList = {};
  vehicleTripId;
  hasTripStarted = false;
  consignee;
  vehicleTripStatus;
  tripended = false;
  
  constructor(private http: HttpClient, private auth: AuthService, public navCtrl: NavController, 
    private nativeStorage: NativeStorage,private alertCtrl: AlertController ) { }

  ngOnInit(): void {
    this.getData();
  }

  // this function used for navigate another page like sque page
  squeroot(pickupRequestId, consignee,consno) {
    this.navCtrl.push(SkulistComponent, { pickupRequestId: pickupRequestId, consignee: consignee ,consigneeno:consno });
  }
  startTrip() {
    let userId = this.auth.getUserId();

    this.http.get(this.auth.getRemoteUrl() + '/cargo/api/hub/update_vehicleTrip?mobileTripProcessFlag=1&vehicleTripId=' + this.vehicleTripId + '&status=' + (this.hasTripStarted ? 3 : 2) + '&loggedInUserId=' + userId, { headers: this.auth.getRequestHeaders() }).subscribe((data) => {
      console.log(data);
      if(data['status'] = "success"){
        this.hasTripStarted = !this.hasTripStarted;
      if (this.hasTripStarted) {
        alert("Trip has started!");
        this.getData();
      }
      else {
        alert("Trip Ended");
        this.getData();
        
      }

    }
    if(data['status'] = "error"){
      alert("unable to stop trip")
    } 
    }, err => {
      if (this.hasTripStarted)
        alert("Error In Starting the trip!");
      else
        alert("Error In Ending the trip!");
    }
    )
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

  unsuccessful(pickupRequestVehicleTripId) {

let alert = this.alertCtrl.create({
  title: 'Reson For Cancel ? ',
  inputs: [
    {
      id: 'reson',
      name: 'reson',
      placeholder: 'Reson',
      type: 'text'
    }
  ],
  buttons: [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: data => {
        console.log('Cancel clicked');
      }
    },
    {
      text: 'Ok',
      handler: data => {
        if (data.reson) {
          let userId = this.auth.getUserId();
          let str = {
            pickupRequestVehicleTripId: pickupRequestVehicleTripId,
            loggedInUserId: userId,
            attemptedDate: new Date().toISOString().split("T")[0].split("-").join('/'),
            attemptedTime: new Date().toTimeString().split(":").splice(0, 2).join(":"),
            remarks: data.reson,
            unsuccessfullType: 2
          }
            
          if (this.vehicleTripStatus == 1) this.startTrip();
          this.http.post(this.auth.getRemoteUrl() + '/cargo/api/hub/unsuccessfull_consignments', str, { headers: this.auth.getRequestHeaders() }).subscribe((data) => {
            console.log(data);
            
          }, err => {
            // alert("Error in marking the consignment as unsuccessfull!");
            console.log(err);
          }
          )
           
            } else {
            console.log("invalid user name password");
            return false;
        }
      }
    }
  ]
});
alert.present();

  }



  pod(pickupRequestVehicleTripId,trip) {
    let userId = this.auth.getUserId();

    this.nativeStorage.setItem('pickupRequestTripId', pickupRequestVehicleTripId)
      .then(() => console.log('Stored pickuprestid Data!'),
      error => console.log('Error storing pickup request id', error));

    this.navCtrl.push(PodComponent,{pickupRequestVehicleTripId:pickupRequestVehicleTripId,triplistinfo:trip});

/*
    let str =
      {
        proofOfDeliveryInput: JSON.stringify({
          pickup_request_vehicle_trip_id: pickupRequestVehicleTripId,
          delivered_to_person: 'xyz',
          user_id: userId,
          delivered_date: new Date().toISOString().split("T")[0].split("-").join('/'),
          delivered_time: new Date().toTimeString().split(":").splice(0, 2).join(":"),
          comment: ''
        })
      }

    if (this.vehicleTripStatus == 1) this.startTrip();
    this.http.post(this.auth.getRemoteUrl() + '/cargo/api/create_proofOfDelivery', this.getFormUrlEncoded(str), { headers: this.auth.getRequestHeaders() }).subscribe((data) => {
      console.log(data);
      alert("Proof of Delivery Created!");
    }, err => {
      alert("Error in creating Proof of Delivery");
    }
    )*/
  }

  getData() {
    let userId = this.auth.getUserId();

    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('vehicleTripId', '119');
    urlSearchParams.append('loggedInUserId', '13');
    /* var data = { message: 197 };
     this.vehicleTripId = data['message'];
     this.http.get(this.auth.getRemoteUrl() + '/cargo/api/hub/retrieve_tripsheet?vehicleTripId=' + data['message'] + '&loggedInUserId=' + userId).subscribe((data) => {
       console.log(data);
       this.tripList = data;
     }
     )*/
    this.http.get(this.auth.getRemoteUrl() + '/cargo/api/retrieve_vehicleTripDriverAssigned?driverId=' + userId, { headers: this.auth.getRequestHeaders() }).subscribe((data) => {
      this.vehicleTripId = data['message'].vehicleTripId;
      this.vehicleTripStatus = data['message'].vehicleTripStatus;
      this.vehicledata.emit({vehicleNo:data['message'].vehicleNo, model: data['message'].vehicleModelName})
      this.hasTripStarted = this.vehicleTripStatus == 2;
      this.http.get(this.auth.getRemoteUrl() + '/cargo/api/hub/retrieve_tripsheet?vehicleTripId=' + this.vehicleTripId + '&loggedInUserId=' + userId, { headers: this.auth.getRequestHeaders() }).subscribe((data) => {
        console.log(data);
        this.tripList = data;
        this.triplistdata.emit(data['message']);
      }, err => {
        // alert("Error in getting triplist");
        console.log("Error in getting triplist");
      }
      )
    }

    )
  }
}





// let userId = this.auth.getUserId();
//     let str = {
//       pickupRequestVehicleTripId: pickupRequestVehicleTripId,
//       loggedInUserId: userId,
//       attemptedDate: new Date().toISOString().split("T")[0].split("-").join('/'),
//       attemptedTime: new Date().toTimeString().split(":").splice(0, 2).join(":"),
//       remarks: '',
//       unsuccessfullType: 2
//     }
//     if (this.vehicleTripStatus == 1) this.startTrip();
//     this.http.post(this.auth.getRemoteUrl() + '/cargo/api/hub/unsuccessfull_consignments', JSON.stringify(str), { headers: this.auth.getRequestHeaders() }).subscribe((data) => {
//       console.log(data);
//       alert("Consignment has been marked as unsuccessfull!");
//     }, err => {
//       alert("Error in marking the consignment as unsuccessfull!");
//     }
//     )