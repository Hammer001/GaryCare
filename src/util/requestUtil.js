import React from "react";
import Taro from "@tarojs/taro";
import { globalUrl } from "./globalUrl";
import { showToast } from "./toastUtil";
import _ from "lodash";

export async function newRequest(url, params) {
  const response = await Taro.request({
    url: globalUrl + url,
    method: "POST",
    data: params,
    header: {
      "content-type": "application/json"
    },
    fail: () => {
      showToast("网络连接错误！", "close", 3500);
    }
  });
  console.log("newRequest", response);
  if (_.get(response, "data", null)) {
    if (
      _.get(response, "data.error", null) &&
      _.get(response, "data.msg", null)
    ) {
      showToast(_.get(response, "data.msg"), "close", 3500);
    }
    return response.data;
  } else {
    showToast("网络连接错误！", "close", 3500);
    return false;
  }
}
