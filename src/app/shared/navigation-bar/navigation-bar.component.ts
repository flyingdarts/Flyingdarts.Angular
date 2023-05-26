import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { AmplifyAuthService } from './../../services/amplify-auth.service';
import { UserProfileStateService } from './../../services/user-profile-state.service';
import { AnimationOptions } from 'ngx-lottie';
import { Subscription } from 'rxjs';
import { WebSocketService } from "./../../infrastructure/websocket/websocket.service";
import { WebSocketActions } from './../../infrastructure/websocket/websocket.actions.enum';
import { UserProfileDetails } from '../models/user-profile-details.model';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit, OnDestroy {
  public currentYear: number = new Date().getFullYear();
  public lottieOptions: AnimationOptions = {
    path: '/assets/animations/flyingdarts_icon.json',
    loop: false
  };
  public userName: string = ''; // Initial value is an empty string
  public isAuthenticated: boolean = false; // Initial value is false
  public isRegistered: boolean = false; // Initial value is false
  
  private userProfileSubscription?: Subscription = undefined;
  private isAuthenticatedSubscription?: Subscription = undefined;
  private isRegisteredSubscription?: Subscription = undefined;

  constructor(
    public router: Router,
    public amplifyAuthService: AmplifyAuthService, 
    public userProfileService: UserProfileStateService,
    public webSocketService: WebSocketService
  ) {}

  onAnimate(animationItem: AnimationItem): void {
    console.log(animationItem);
  }

  ngOnInit() {
    console.log(this.userProfileService.currentUserProfileDetails);
    this.isRegistered = this.userProfileService.currentUserProfileDetails != null;
    this.userName = this.userProfileService.currentUserProfileDetails.UserName!;
    this.webSocketService.getMessages().subscribe(x=> {
      switch(x.action) {
        case WebSocketActions.UserProfileGet:
        case WebSocketActions.UserProfileCreate:
        case WebSocketActions.UserProfileUpdate:
          if (x.message != null) {
            this.userProfileService.currentUserProfileDetails = (x.message as UserProfileDetails)
          }
        break;
      }
    })
    this.userProfileSubscription = this.userProfileService.userName$.subscribe(
      (userName: string) => {
        this.userName = userName;
        console.log("Username: ", this.userName);
      }
    );

    this.isAuthenticatedSubscription = this.amplifyAuthService.isAuthenticated$.subscribe(
      (isAuthenticated: boolean) => {
        this.isAuthenticated = isAuthenticated;
        console.log("Is authenticated: ", this.isAuthenticated);
      }
    );
  }

  ngOnDestroy() {
    this.userProfileSubscription?.unsubscribe();
    this.isAuthenticatedSubscription?.unsubscribe();
    this.isRegisteredSubscription?.unsubscribe();
  }
  
  title = 'flyingdarts';

  public signOut(): void {
    this.userProfileService.clear();
    this.amplifyAuthService.signOut();
  }
}
