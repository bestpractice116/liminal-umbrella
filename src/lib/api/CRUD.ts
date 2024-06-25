import { methods, Route, type ApiRequest, type ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import type { SchemaBundle } from "common/schema"
import { getSchemaKeys } from 'common';
import { AuthenticatedAdmin } from '../api/decorators.js';
import {Sequential} from '../utils.js';

export abstract class CR extends Route {
  abstract getModel(): any;
  abstract getSchema(): SchemaBundle;
  getRetrieveWhere(): any {
    return {};
  }
  onMuatation() {}

  // Get current list
  @AuthenticatedAdmin()
  @Sequential
  public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
      const stuffs = await this.getModel().findAll({ where: this.getRetrieveWhere() });
      const schemaKeys = getSchemaKeys(this.getSchema().update);
      response.json(stuffs.map((stuff: any) => schemaKeys.reduce((acc, cv) => {
        const out = {...acc} as any
        out[cv] = stuff.get(cv)
        return out
      }, {})))
  }

  // Add a new one
  @AuthenticatedAdmin()
  @Sequential
  public async [methods.POST](request: ApiRequest, response: ApiResponse) {
      const { success, error, data } = this.getSchema().create.safeParse(request.body);
      if (!success) {
          response.status(HttpCodes.BadRequest).json({status: "error", error: error.issues });
          return;
      }
      const item = await this.getModel().create(data);
      this.onMuatation()
      const schemaKeys = getSchemaKeys(this.getSchema().update);
      const datum = schemaKeys.reduce((acc, cv) => { const i = {...acc} as any;
        i[cv] = item.get(cv);
        return i
       }, {})
      response.status(HttpCodes.Created).json({status: "ok", datum });
  }
}

export abstract class UD extends Route {
    abstract getModel(): any;
    abstract getSchema(): SchemaBundle;
    getRetrieveWhere(): any {
      return {};
    }
    onMuatation() {}

    protected async findItem(params: ApiRequest['params'], response: ApiResponse): Promise<any | null> {
      const { success, error, data } = this.getSchema().delete.safeParse(params);
      if (!success) {
          response.status(HttpCodes.BadRequest).json({status: "error", error: error.issues });
          return null;
      }
      const item = await this.getModel().findOne({where: data});
      if (!item) {
          response.status(HttpCodes.NotFound).json({status: "error", error: "Item not found"});
          return null;
      }
      return item;
    }

    @AuthenticatedAdmin()
    @Sequential
    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
      const item = await this.findItem(request.params, response);
      if (!item) {
          return;
      }
=      const { success, error, data } = this.getSchema().update.safeParse(request.body);
        if (!success) {
            response.status(HttpCodes.BadRequest).json({status: "error", error: error.issues });
            return;
        }
        // TODO - No XSS
        item.set(data);
        await item.save();
        this.onMuatation()
        response.json({status: "ok", datum: data});
    }

    @AuthenticatedAdmin()
    @Sequential
    public async [methods.DELETE](request: ApiRequest, response: ApiResponse) {
      const item = await this.findItem(request.params, response);
      if (!item) {
          return;
      }
        await item.destroy();
        this.onMuatation()
        response.json({status: "deleted", datum: request.params});
    }
}