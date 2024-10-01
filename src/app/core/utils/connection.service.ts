import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ResponseI } from '../interfaces/Response';
import { Observable } from 'rxjs';
import { IBaseRequest } from '../services/http/requests/base.request';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private apiUrl: string = environment.APIUrl;
  private dataUrl = 'assets/json';

  constructor(private http: HttpClient) { }

  send(path: string, type: string, ...params: any[]): Promise<ResponseI> {
    const url = `${this.apiUrl}/${path}`;
    let request: any;
    switch (type) {
      case 'get':
        request = this.http.get<any>(url);
        break;
      case 'post':
        request = this.http.post<any>(url, params[0]);
        break;
      case 'put':
        request = this.http.put<any>(url, params[0]);
        break;
      case 'delete':
        request = this.http.delete<any>(url);
        break;
      case 'upload':
        request = this.http.post<any>(url, params[0]);
        break;
      default:
        request = this.http.get<any>(url);
        break;
    }

    return request.toPromise()
      .catch((error: HttpErrorResponse) => {
        let resp: ResponseI = {
          status: 400,
          message: error.error?.message || 'Something went wrong',
          comment: error.error?.comment || 'Please try again later',
          data: null
        };
        return resp;
      });
  }

  post(path: string, req: IBaseRequest): Promise<ResponseI> {
    return this.send(path, 'post', req.toJson());
  }

  put(path: string, req: IBaseRequest): Promise<ResponseI> {
    return this.send(path, 'put', req.toJson());
  }

}
