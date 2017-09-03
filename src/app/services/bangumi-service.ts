import { Injectable } from "@angular/core";
import { Http, RequestOptions, Headers, Response } from "@angular/http";
import { SettingService, Setting } from "./setting-service";
import { Utils } from "../utils";
import { Observable } from 'rxjs/Rx';

export interface Bangumi {
  id: number,
  name: string,
  cur_epi: number,
  on_air_epi: number, // Placeholder
  on_air_day: number,
  seeker: string,
  seekers_obj: Seeker[]
}

export interface Seeker {
  seeker: string,
  chk_key: string
}

export interface BangumiCheckUp {
  link: string,
  title: string
}

export class ParseSettingError extends Error {}

@Injectable()
export class BangumiService {
  constructor(
    private http: Http,
    private settingSvc: SettingService,
    private utils: Utils
  ) {
  }

  private _getRequestOptions = (endpoint: string): RequestOptions => {
    let setting = this.settingSvc.getSetting();
    let requestOptions = new RequestOptions();
    requestOptions.url = this.utils.joinUrl(setting.url, endpoint);
    let headers = new Headers();
    headers.append("X-Auth-Token", setting.token);
    requestOptions.headers = headers;

    return requestOptions;
  }

  handleError = (error: any) => {
    console.error(error);
    return Observable.throw(error);
  }

  getCheckPoint = (): Promise<null> => {
    return new Promise((resolve, reject) => {
      let requestOptions: RequestOptions;
      try {
        requestOptions = this._getRequestOptions("checkpoint");
      } catch(Error) {
        reject(new ParseSettingError("Parse setting error."));
      }

      this.http.get(requestOptions.url, requestOptions)
      .catch(this.handleError)
      .subscribe((res: Response) => {
        resolve();
      }, (err: Response)=>{
        reject(new Error(err.statusText));
      });
    })
  }

  getAllBangumis = (): Promise<Bangumi[]> => {
    return new Promise<Bangumi[]>((resolve, reject) => {
      let requestOptions = this._getRequestOptions("get");

      this.http.get(requestOptions.url, requestOptions)
      .catch(this.handleError)
      .subscribe((res: Response) => {
        let results: Bangumi[] = res.json();
        for(let bangumi of results) {
          bangumi.seekers_obj = JSON.parse(bangumi.seeker);
        }
        resolve(results);
      }, (err: Response)=>{
        reject(new Error(err.statusText));
      });
    });
  }

  getBangumiCheckUp = (b: Bangumi): Promise<BangumiCheckUp[]> => {
    return new Promise<BangumiCheckUp[]>((resolve, reject) => {
      let requestOptions = this._getRequestOptions("checkup/"+b.id);

      this.http.get(requestOptions.url, requestOptions)
      .catch(this.handleError)
      .subscribe((res: Response) => {
        let results: BangumiCheckUp[] = res.json();
        resolve(results);
      }, (err: Response) => {
        reject(new Error(err.statusText));
      });
    });
  }

  plusBangumi = (b: Bangumi): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
      let requestOptions = this._getRequestOptions("plus/"+b.id);

      this.http.get(requestOptions.url, requestOptions)
      .catch(this.handleError)
      .subscribe((res: Response) => {
        let data = res.json();
        resolve(data.cur_epi);
      }, (err: Response) => {
        reject(new Error(err.statusText));
      });
    });
  }

  decreaseBangumi = (b: Bangumi): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
      let requestOptions = this._getRequestOptions("decrease/"+b.id);

      this.http.get(requestOptions.url, requestOptions)
      .catch(this.handleError)
      .subscribe((res: Response) => {
        let data = res.json();
        resolve(data.cur_epi);
      }, (err: Response) => {
        reject(new Error(err.statusText));
      });
    });
  }

  updateBangumi = (b: Bangumi): Promise<Bangumi> => {
    return new Promise<Bangumi>((resolve, reject) => {
      let requestOptions = this._getRequestOptions("modify/"+b.id);
      b.seeker = JSON.stringify(b.seekers_obj);
      let body = new FormData();
      body.append("name", b.name);
      body.append("cur_epi", b.cur_epi.toString());
      body.append("on_air", b.on_air_day.toString());
      body.append("seeker", b.seeker);

      this.http.post(requestOptions.url, body, requestOptions)
      .catch(this.handleError)
      .subscribe((res: Response) => {
        let result: Bangumi = res.json();
        result.seekers_obj = JSON.parse(result.seeker);
        resolve(result);
      }, (err: Response) => {
        reject(new Error(err.statusText));
      });
    });
  }

  createBangumi = (b: Bangumi): Promise<Bangumi> => {
    return new Promise<Bangumi>((resolve, reject) => {
      let requestOptions = this._getRequestOptions("add");
      b.seeker = JSON.stringify(b.seekers_obj);
      let body = new FormData();
      body.append("name", b.name);
      body.append("cur_epi", b.cur_epi.toString());
      body.append("on_air", b.on_air_day.toString());
      body.append("seeker", b.seeker);

      this.http.post(requestOptions.url, body, requestOptions)
      .catch(this.handleError)
      .subscribe((res: Response) => {
        let result: Bangumi = res.json();
        result.seekers_obj = JSON.parse(result.seeker);
        resolve(result);
      }, (err: Response) => {
        reject(new Error(err.statusText));
      });
    });
  }

  deleteBangumi = (b: Bangumi): Promise<null> => {
    return new Promise((resolve, reject) => {
      let requestOptions = this._getRequestOptions("remove/"+b.id);

      this.http.get(requestOptions.url, requestOptions)
      .catch(this.handleError)
      .subscribe((res: Response) => {
        resolve();
      }, (err: Response) => {
        reject(new Error(err.statusText));
      });
    });
  }

  getAllSeekers = (): Promise<Seeker[]> => {
    return new Promise<Seeker[]>((resolve, reject) => {
      let requestOptions = this._getRequestOptions("get_seekers");

      this.http.get(requestOptions.url, requestOptions)
      .catch(this.handleError)
      .subscribe((res: Response) => {
        let result: Seeker[] = res.json();
        resolve(result);
      }, (err: Response) => {
        reject(new Error(err.statusText));
      });
    });
  }
}
