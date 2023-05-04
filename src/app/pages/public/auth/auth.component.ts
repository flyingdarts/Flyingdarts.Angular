import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticatorService } from '@aws-amplify/ui-angular';
import { RegistrationSteps } from './RegistrationSteps';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  public activeStep: number = RegistrationSteps.CreateAccount;
  constructor(public authenticator: AuthenticatorService, private router: Router) {

  }

  ngOnInit(): void {
    if (!!this.authenticator.user) {
      if (this.activeStep == RegistrationSteps.CreateAccount) {
        this.activeStep = RegistrationSteps.CreateProfile;
      }
      if (this.activeStep == RegistrationSteps.CreateProfile) {
        this.activeStep = RegistrationSteps.GiveCameraPermission;
      }
      if (this.activeStep == RegistrationSteps.GiveCameraPermission) {
        // todo: store the registration details
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/auth']);
    }
  }

  async accessCamera() {
    const videoPlayer = document.querySelector('video') as HTMLVideoElement;
    await this.requestCameraPermissions().then(stream => {
      videoPlayer.srcObject = stream;
      this.activeStep == RegistrationSteps.Completed;
      this.populateCameraSelectList();
    }).catch(error => {
      console.error('Failed to attach stream to video element', error);
    });
  }
  populateCameraSelectList() {
    if (!this.checkCameraPermission()) {
      return;
    }
    // Get the select element and video element from the DOM
    const selectElement = document.querySelector<HTMLSelectElement>('#cameraFormSelectCamera');
    const videoElement = document.querySelector<HTMLVideoElement>('#videoPlayer');

    // Populate the select element with the available webcams
    this.populateWebcamSelectList(selectElement!).then(devices => {
      // Add an event listener to the select element to switch the webcam when the user selects a new option
      selectElement!.addEventListener('change', () => {
        const selectedDeviceId = selectElement!.value;
        this.switchWebcam(selectedDeviceId, videoElement!);
      });
    });
  }
  async checkCameraPermission(): Promise<boolean> {
    if (!navigator.permissions || !navigator.permissions.query) {
      // Permissions API not supported, assume permission was granted
      return true;
    }
    const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
    return permissionStatus.state === 'granted';
  }


  async requestCameraPermissions(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('Camera access granted');
      return stream;
    } catch (error) {
      console.error('Camera access denied', error);
      throw error;
    }
  }
  // Get the available webcams and populate a select element with their names and IDs
  async populateWebcamSelectList(selectElement: HTMLSelectElement): Promise<MediaDeviceInfo[]> {
    // Get the list of available media devices
    const devices = await navigator.mediaDevices.enumerateDevices();

    // Filter the list to only include video input devices
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    // Create an option element for each video device and add it to the select element
    videoDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Camera ${selectElement.options.length + 1}`;
      selectElement.appendChild(option);
    });
    console.log(videoDevices);
    // Return the list of video devices
    return videoDevices;
  }

  // Switch the video stream to the selected webcam
  async switchWebcam(selectedDeviceId: string, videoElement: HTMLVideoElement): Promise<void> {
    // Get the current video stream
    const stream = videoElement.srcObject as MediaStream;

    // Stop the current video stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    // Get the media constraints for the selected device
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: { exact: selectedDeviceId }
      }
    };

    // Get the new video stream
    const newStream = await navigator.mediaDevices.getUserMedia(constraints);

    // Set the new video stream as the source of the video element
    videoElement.srcObject = newStream;
  }

}


