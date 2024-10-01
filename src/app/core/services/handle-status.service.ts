import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class HandleStatusService {

  private eventSource!: EventSource;
  private eventSubject: Subject<any> = new Subject<any>();
  private env = environment;
  constructor() { }

  startEventStream(): Observable<any> {
    this.eventSource = new EventSource(this.env.APIUrl + '/handler-status');

    this.eventSource.onopen = (event) => {
      console.log('Established connection.');
    };

    this.eventSource.onerror = (error) => {
      this.eventSubject.error(error);
    };

    this.eventSource.onmessage = (event) => {
      const data = event.data;
      this.eventSubject.next(data);
    };

    return this.eventSubject.asObservable();
  }

  stopEventStream(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

}