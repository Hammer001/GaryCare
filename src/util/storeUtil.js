import React from "react";
import Taro from "@tarojs/taro";

export function getGaryData() {
  Taro.getStorage({
    key: "gary-care",
    success: res => {
      const getData = _.get(res, "data", null);
      return getData;
    }
  });
}

export function getDurationData() {
  Taro.getStorage({
    key: "gary-duration",
    success: res => {
      const getData = _.get(res, "data", null);
      return getData;
    }
  });
}
