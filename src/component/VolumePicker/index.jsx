import React, { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Picker, Text } from "@tarojs/components";
import { AtList, AtListItem } from "taro-ui";
import "../component.scss";

const selectorData = {
  duration: {
    name: "小时",
    data: [1, 2, 3, 4, 5, 6, 7, 8].map(n => n + "小时")
  },
  volume: {
    name: "毫升",
    data: [
      10,
      20,
      30,
      40,
      50,
      60,
      70,
      80,
      90,
      100,
      110,
      120,
      130,
      140,
      150,
      160,
      170,
      180,
      190,
      200
    ].map(n => n + "毫升")
  }
};

const renderKeys = {
  duration: "duration",
  volume: "volume",
  volume_record: "volume"//volume_record使用volume的数据
};

/**
 * Picker组件：setting页面和record页面使用
 * 将所有的picker放到一个组件里使用，共用一个毫升和时间的数据
 */
const VolumePicker = ({ keys, title, afterSetSuccess, defaultValue }) => {
  const newKeys = renderKeys[keys]; //输入组件的keys，record页面中调用需做额外处理，需要返回另外的值
  const [selector, setSelector] = useState(selectorData[newKeys].data);
  const [checked, setChecked] = useState("");

  useEffect(() => {
    let getKey = "gary" + "-" + newKeys;
    Taro.getStorage({
      key: getKey,
      success: res => {
        const resData = _.get(res, "data", null);
        setChecked(resData ? resData + selectorData[newKeys].name : "未选择");
        if (resData && newKeys === "volume_record") { // record页面中输出defaultValue，点击‘现在喂’的时候可以存储数据
          defaultValue(resData);
        }
      }
    });

    return () => {};
  }, []);

  function changePicker(e) {
    const index = Number(e.detail.value);
    let getKey = "gary" + "-" + newKeys;
    let storeData;

    setChecked(selector[index]);

    if (keys === "volume") {
      storeData = (index + 1) * 10;
      storeGlobalData(getKey, storeData);
    } else if (keys === "duration") {
      storeData = index + 1;
      storeGlobalData(getKey, storeData);
    } else {
      storeData = (index + 1) * 10;
      afterSetSuccess(storeData); //只向上输出数据，不执行存储数据
    }
  }

  function storeGlobalData(key, data) {
    Taro.setStorage({
      key: key,
      data: data,
      success: res => {
        Taro.showToast({
          title: "设置成功！",
          icon: "success",
          duration: 2000
        });
        afterSetSuccess(true);
      }
    });
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
