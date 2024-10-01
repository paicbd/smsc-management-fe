import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
  providedIn: 'root'
})
export class GatewaySs7Service {

    constructor(private connectionService: ConnectionService) {}

    async getGatewaySs7(): Promise<ResponseI> {
        return this.connectionService.send('ss7-gateways', 'get');
    }

    async getGatewaySs7ById(id: number): Promise<ResponseI> {
        return this.connectionService.send(`ss7-gateways/${id}`, 'get');
    }

    async createGatewaySs7(gateway: any): Promise<ResponseI> {
        return this.connectionService.send('ss7-gateways/create', 'post', gateway);
    }

    async updateGatewaySs7(gateway: any): Promise<ResponseI> {
        return this.connectionService.send(`ss7-gateways/update/${gateway.network_id}`, 'put', gateway);
    }

    async refreshSettingSs7(id:number):Promise<ResponseI> {
      return this.connectionService.send(`ss7-gateways/refresh-setting/${id}`, 'get');
    }

}
