import React from "react";
import Taro from "@tarojs/taro";

export function showToast(text, icon, timer) {
  Taro.showToast({
    title: text,
    icon: icon,
    duration: timer
  });
}
