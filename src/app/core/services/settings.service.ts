import { Injectable } from '@angular/core';
import { ConnectionService } from '../utils/connection.service';
import { ResponseI } from '../interfaces/Response';

@Injectable({
    providedIn: 'root'
})
export class SettingServices {

    constructor(private connectionService: ConnectionService) { }

    async getSmppServerConfig(): Promise<ResponseI> {
        return this.connectionService.send('smpp-server-config', 'get');
    }

    async updateStatus(status: any): Promise<ResponseI> {
        return this.connectionService.send(`smpp-server-config/new-status/${ status }`, 'post');
    }

    async getHttpServerConfig(): Promise<ResponseI> {
        return this.connectionService.send('http-server-config', 'get');
    }

    async updateStatusHttp(application_name: string, new_status: string): Promise<ResponseI> {
        return this.connectionService.send(`http-server-status?application_name=${ application_name }&new_status=${ new_status }`, 'post');
    }

    async updateAllStatusHttp(new_status: string): Promise<ResponseI> {
        return this.connectionService.send(`http-server-status/all?new_status=${ new_status }`, 'post');
    }

    async getGeneralSetting(): Promise<ResponseI> {
        return this.connectionService.send('general-settings', 'get');
    }

    async updateGeneralSetting(setting: any): Promise<ResponseI> {
        return this.connectionService.send('general-settings/update', 'put', setting);
    }

    async getRetriesSetting(): Promise<ResponseI> {
        return this.connectionService.send('general-settings/smsc-retry', 'get');
    }

    async updateRetriesSetting(setting: any): Promise<ResponseI> {
        return this.connectionService.send('general-settings/smsc-retry/update', 'put', setting);
    }

    async getSmscSetting(): Promise<ResponseI> {
        return this.connectionService.send('smsc-settings/variables', 'get');
    }

    async updateSmscSetting(setting: any): Promise<ResponseI> {
        return this.connectionService.send('smsc-settings/massiveUpdate', 'put', setting);
    }
}
