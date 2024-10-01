import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ConnectionService } from '@core/index';

const URL = environment.APIUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public token: any = null;
  public identity: any = '';
  public headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient,
    private router: Router,
    private connectionService: ConnectionService
  ) {
  }

  getAuthToken():string {
    return localStorage.getItem('accessToken') || '';
  }

  signup(user: any): Promise<any>
  {
    const params = JSON.stringify(user);

    return this.connectionService.send(`auth/authenticate`, 'post', params);
  }

  async getIdentity()
  {
    let value = localStorage.getItem('userName');
    let identity = (value != null) ? value : '';
    if(identity && identity != "undefined")
      this.identity = identity;
    else
      this.identity = null;

    return this.identity;
  }

  async getToken()
  {
    let token = localStorage.getItem('accessToken');
    if(token != "undefined")
    {
      this.token = token;
    }
    else{
        this.token = null;
    }
      return this.token;
  }

  async validateToken(): Promise<boolean>
  {
    this.getToken();
    if ( !this.token && this.token != '')
    {
      this.router.navigate(['/auth/login']);
      return Promise.resolve(false);
    }

    return new Promise<boolean>(async resolve => {

      this.getIdentity();
      if ( this.identity && this.identity != '' )
      {
        resolve( true );
      }
      else
      {
        resolve( false );
        this.router.navigate(['/auth/login']);
      }
    });
  }

  async logout()
  {
    this.token = null;
    this.identity = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('identity');
    localStorage.removeItem('userName');
    this.router.navigateByUrl('/auth/login');
  }

}