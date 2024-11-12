import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';
import { Observable } from 'rxjs/internal/Observable';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BroadCastService {
  
  constructor(private connectionService: ConnectionService) {}

  async getBroadCast(): Promise<ResponseI> {
    return this.connectionService.send('broadcast', 'get');
  }

  async getBroadCastById(id: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/${id}`, 'get');
  }

  async createBroadCast(broadcast: FormData): Promise<ResponseI> {
    return this.connectionService.send('broadcast', 'post', broadcast);
  }
  
  async updateBroadCast(broadcast: FormData): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/${broadcast.get('id')}`, 'put', broadcast);
  }

  async startBroadCast(id: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/start/${id}`, 'post');
  }

  async deleteBroadCast(id: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/${id}`, 'delete');
  }

  async refreshStatistic(): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/statistic/start`, 'post', null);
  }

  async requestFileDownload(broadcastId: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/logs/${broadcastId}`, 'post');
  }

  async checkFileStatus(fileId: number): Promise<ResponseI> {
    return this.connectionService.send(`broadcast/logs/${fileId}`, 'get');
  }

  async downloadReportStream(token: string) {
    return this.connectionService.downloadFile(`broadcast/download/logs/${token}`);
  }
}