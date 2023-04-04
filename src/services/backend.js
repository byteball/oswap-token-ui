import axios from "axios";
import moment from "moment";

import appConfig from "appConfig";

class Backend {
  constructor(url) {
    this.service = axios.create({
      baseURL: url,
    });
  }

  async getPrice7d() {
    const data = await this.service.get("/candles", { params: { type: "hourly", onlyPrice: true, limit: 168 } });

    return data.data?.data;
  }

  async getCandles() {
    const data = await this.service.get("/candles", { params: { type: "daily", limit: 360 } });

    return data.data?.data.map(({ start_timestamp, ...rest }) => ({ ...rest, start_timestamp: moment.unix(start_timestamp).format("LLL") }));
  }
}

export const BackendService = new Backend(appConfig.BACKEND_URL);
