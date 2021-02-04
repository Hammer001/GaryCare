import React, { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Picker, Text } from "@tarojs/components";
import { AtList, AtListItem } from "taro-ui";
import _ from "lodash";
import "../component.scss";

const volumeArray = Array(20)
  .toString()
  .split(",")
  .map(function(item, index) {
    let number = (index + 1) * 10;
    return number + "毫升";
  });
const selectorData = {
  duration: {
    name: "小时",
    data: [1, 2, 3, 4, 5, 6, 7, 8].map(n => n + "小时")
  },
  volume: {
    name: "毫升",
    data: volumeArray
  },
  volume_record: {
    name: "毫升",
    data: ["亲喂", ...volumeArray]
  }
};

const renderKeys = {
  duration: "duration",
  volume: "volume",
  volume_record: "volume" //volume_record使用volume的数据
};

/**
 * Picker组件：setting页面和record页面使用
 * 将所有的picker放到一个组件里使用，共用一个毫升和时间的数据
 */
const VolumePicker = ({
  keys,
  title,
  glbCustom,
  afterSetSuccess,
  defaultValue,
  updateGlobalData
}) => {
  const newKeys = renderKeys[keys]; //通过组件的keys，record页面中调用需做额外处理，需要返回另外的值
  //方便调用相同的数据
  const [selector, setSelector] = useState(selectorData[keys].data);
  const [checked, setChecked] = useState("");
  const [custom, setCustom] = useState({});

  useEffect(() => {
    // console.log(resData);
    /**
     * 2.0.8 全局数据维护，不再使用storage存储
     */
    if (glbCustom) {
      setCustom(glbCustom);
    }
    setChecked(glbCustom ? glbCustom[newKeys] : "未选择");
    if (glbCustom && keys === "volume_record") {
      // !! keys===volume_record时候，是在record中使用的，需要判断props上面的keys
      // record页面中输出defaultValue，点击‘现在喂’的时候可以存储数据
      defaultValue(glbCustom[newKeys]);
    }

    return () => {};
  }, []);

  function changePicker(e) {
    const index = Number(e.detail.value);
    let storeData;

    setChecked(selector[index]);
    storeData = selector[index];

    if (keys === "volume") {
      storeGlobalData(keys, storeData);
    } else if (keys === "duration") {
      storeGlobalData(keys, storeData);
    } else {
      afterSetSuccess(storeData); //只向上输出数据，不执行存储数据
    }
  }

  function storeGlobalData(key, data) {
    let newData = custom;
    newData[key] = data;

    updateGlobalData(newData);
  }

  return (
    <Picker mode="selector" range={selector} onChange={changePicker}>
      <AtList>
        <AtListItem title={title} extraText={checked} />
      </AtList>
    </Picker>
  );
};

export default VolumePicker;
