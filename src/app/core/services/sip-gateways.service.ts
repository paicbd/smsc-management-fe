import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';
import { ApiContext } from '../utils/types/api-context.type';

@Injectable({
  providedIn: 'root',
})
export class SipGatewaysService {
  constructor(private connectionService: ConnectionService) {}
  private readonly basePath = 'sip-gateways';


  async getSipGateways(_ctx: ApiContext = ApiContext.SMSC): Promise<ResponseI> {
    return this.connectionService.send(this.basePath, 'get');
  }

  async getSipGatewaysById(networkId: number): Promise<ResponseI> {
    return this.connectionService.send(`${this.basePath}/${networkId}`, 'get');
  }

  async createSipGateways(payload: any): Promise<ResponseI> {
    return this.connectionService.send(`${this.basePath}/create`, 'post', payload);
  }

  async updateSipGateways(networkId: number, payload: any): Promise<ResponseI> {
    return this.connectionService.send(`${this.basePath}/update/${networkId}`,'put',payload);
  }

  async refreshSipGateways(networkId: number): Promise<ResponseI> {
    return this.connectionService.send(`${this.basePath}/refresh-setting/${networkId}`,'get'
    );
  }
}
