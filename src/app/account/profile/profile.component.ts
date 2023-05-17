import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketActions } from 'src/app/infrastructure/websocket/websocket.actions.enum';
import { AmplifyAuthService } from 'src/app/services/amplify-auth.service';
import { UserProfileApiService } from 'src/app/services/api/user-profile-api.service';
import { UserProfileService } from 'src/app/services/user-profile.service';
import { WebSocketService } from 'src/app/services/websocket.service';
import { CarouselModel } from 'src/app/shared/carousel/carousel.component';
import { UserProfileDetails } from 'src/app/shared/models/user-profile-details.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  carouselItems: CarouselModel[] = [
    {
      src: '/assets/registration/social_media.svg',
      title: 'Username',
      description: 'You can only change your username once every 30 days.'
    },
    {
      src: '/assets/registration/personal_data.svg',
      title: 'Email',
      description: 'We will send you an email with a verification link.'
    },
    {
      src: '/assets/registration/video_call.svg',
      title: 'Camera',
      description: 'Go to the settings page for camera configuration.'
    }
  ];
  constructor(private formBuilder: FormBuilder,
    private apiService: UserProfileApiService,
    private authService: AmplifyAuthService,
    private webSocketService: WebSocketService,
    private router: Router) {
    this.profileForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  async ngOnInit() {
    this.apiService.getUserProfile(await this.authService.getCognitoUserId());

    this.webSocketService.getMessages().subscribe(x => {
      if (x.action === WebSocketActions.UserProfileGet) {
        this.initForm(x.message as UserProfileDetails);
      }
      if (x.action === WebSocketActions.UserProfileUpdate) {
        this.router.navigate(['/', 'lobby'])
      }
    })
  }
  initForm(preloadedData: UserProfileDetails) {
    this.profileForm = this.formBuilder.group({
      userName: preloadedData.UserName || '',
      country: preloadedData.Country || '',
      email: preloadedData.Email || '',
    });
  }

  async updateProfile() {
    if (this.profileForm.valid) {
      this.apiService.updateUserProfile(
        await this.authService.getCognitoUserId(),
        this.profileForm.value.userName,
        this.profileForm.value.email,
        this.profileForm.value.country);
    }
  }
}
