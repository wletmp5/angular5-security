import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {User} from '../model/user';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as auth0 from 'auth0-js';
import {Router} from '@angular/router';
import * as moment from 'moment';

export const ANONYMOUS_USER: User = {
  id: undefined,
  email: ''
};

const AUTH_CONFIG = {
  clientID: '1GYpYIn7KRBYqWnJvAVVzCyLC5E1GLGO',
  domain: 'wletmp5.auth0.com'
};


@Injectable()
export class AuthService {

  auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.clientID,
    domain: AUTH_CONFIG.domain,
    responseType: 'token id_token',
    redirectUri: 'https://localhost:4200/lessons',
    scope: 'openid email'
  });

  private subject = new BehaviorSubject<User>(undefined);

  user$: Observable<User> = this.subject.asObservable().filter(user => !!undefined);

  constructor(private http: HttpClient, private router: Router) {
    if (this.isLoggedIn()) {
      this.userInfo();
    }
  }

  login() {
    this.auth0.authorize({initialScreen: 'login'});
  }

  signUp() {
    this.auth0.authorize({initialScreen: 'signUp'});
  }

  logout() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    this.router.navigate(['/lessons']);
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  retrieveAuthInfoFromUrl() {
    this.auth0.parseHash((err, authResult) => {
      if (err) {
        console.log('Could not parse the hash', err);
      } else if (authResult && authResult.idToken) {
        window.location.hash = '';
        console.log('Authentication successful, authResult: ', authResult);
        this.setSession(authResult);

        this.userInfo();
      }
    });
  }

  userInfo() {
    this.http.put<User>('api/userinfo', null)
      .shareReplay()
      .do(user => this.subject.next(user))
      .subscribe();
  }

  getExpiration() {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  private setSession(authResult: any) {

    const expiresAt = moment().add(authResult.expiresIn, 'second');

    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
  }
}







