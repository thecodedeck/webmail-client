import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {
    // Check if the user is already logged in
    if (localStorage.getItem('user') && localStorage.getItem('password')) {
      this.user = localStorage.getItem('user') || '';
      this.password = localStorage.getItem('password') || '';

      // Set the loggedIn$ to true
      this.loggedIn$.next(true);
    }
  }

  // Default username and password
  user: string = '';
  password: string = '';

  // Is the user logged in
  loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Login
  // To login we do not need to send the credentials to the server and the auth interceptor will handle the credentials
  login(user: string, password: string) {
    this.user = user;
    this.password = password;

    // Save to local storage
    localStorage.setItem('user', user || '');
    localStorage.setItem('password', password || '');

    // Send the credentials to the server (technically can be done with any request since we are using an interceptor)
    return this.http.get('http://localhost:3000/login');
  }

  // Check if the user is logged in
  // Currently not used
  loggedIn() {
    return this.http.get('http://localhost:3000/logged-in');
  }

  // Logout the user
  // This also terminates the imap connection on the server
  logout() {
    this.user = '';
    this.password = '';

    return this.http.get('http://localhost:3000/logout');
  }
}
