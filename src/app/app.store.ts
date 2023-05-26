import { ComponentStore, OnStateInit, OnStoreInit } from "@ngrx/component-store";
import { UserProfileDetails } from "./shared/models/user-profile-details.model";
import { Observable } from "rxjs";
import { WebSocketService } from "./infrastructure/websocket/websocket.service";
import { WebSocketActions } from "./infrastructure/websocket/websocket.actions.enum";
import { Injectable } from "@angular/core";
import { AppState, initialApplicationState } from "./app.state";

@Injectable()
export class AppStore extends ComponentStore<AppState> implements OnStoreInit, OnStateInit {
  constructor(private webSocketService: WebSocketService) {
    super(initialApplicationState);
  }
  ngrxOnStateInit() {
    console.log('app store OnStateInit');
    console.log(this.select(x=>console.log(x)));
    this.profile$.subscribe(x=>console.log(x));
  }

  ngrxOnStoreInit() {
    console.log('app store OnStoreInit');
    console.log(this.select(x=>console.log(x)));
    this.profile$.subscribe(x=>console.log(x));

    this.webSocketService.getMessages().subscribe(x => {
      switch (x.action) {
        case WebSocketActions.UserProfileGet:
        case WebSocketActions.UserProfileCreate:
        case WebSocketActions.UserProfileUpdate:
          if (x.message != null) {
            this.setProfile(x.message as UserProfileDetails);
          }
          break;
      }
    });
  }

  readonly loading$: Observable<boolean> = this.select(x => x.loading);
  readonly profile$: Observable<UserProfileDetails | null> = this.select(x => x.profile);

  readonly setProfile = this.updater((state, value: UserProfileDetails) => ({ ...state, profile: value }));

}
