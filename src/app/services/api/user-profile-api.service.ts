import { Injectable } from '@angular/core';
import { WebSocketService } from '../websocket.service';
import { WebSocketActions } from '../../infrastructure/websocket/websocket.actions.enum';
import { WebSocketMessage } from '../../infrastructure/websocket/websocket.message.model';
import { CreateUserProfileCommand } from 'src/app/requests/CreateUserProfileCommand';
import { GetUserProfileCommand } from 'src/app/requests/GetUserProfileCommand';
import { UpdateUserProfileCommand } from 'src/app/requests/UpdateUserProfileCommand';
@Injectable({ providedIn: 'root' })
export class UserProfileApiService {
  constructor(private webSocketService: WebSocketService) {

  }
  public createUserProfile(cognitoUserId: string, email: string, userName: string, country: string): void {
    var message: CreateUserProfileCommand = {
      CognitoUserId: cognitoUserId,
      UserName: userName,
      Email: email,
      Country: country
    };
    let body: WebSocketMessage<CreateUserProfileCommand> = {
      action: WebSocketActions.UserProfileCreate,
      message: message
    };
    this.webSocketService.postMessage(JSON.stringify(body));
  }

  public getUserProfile(cognitoUserId: string): void {
    var message: GetUserProfileCommand = {
      CognitoUserId: cognitoUserId
    };
    let body: WebSocketMessage<GetUserProfileCommand> = {
      action: WebSocketActions.UserProfileGet,
      message: message
    };
    this.webSocketService.postMessage(JSON.stringify(body));
  }

  public updateUserProfile(cognitoUserId: string, email: string, userName: string, country: string): void {
    var message: UpdateUserProfileCommand = {
      CognitoUserId: cognitoUserId,
      UserName: userName,
      Email: email,
      Country: country
    };
    let body: WebSocketMessage<UpdateUserProfileCommand> = {
      action: WebSocketActions.UserProfileUpdate,
      message: message
    };
    this.webSocketService.postMessage(JSON.stringify(body));
  }
}



