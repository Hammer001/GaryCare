import React, { useState } from "react";
import { View, Picker } from "@tarojs/components";
import { AtInput, AtList, AtListItem } from "taro-ui";
import moment from "moment";
import "./record.scss";

const SleepTime = ({ name, currentDay, time, title, daySwitch, onValue }) => {
  const dayOption = {
    sleepStart: moment(currentDay)
      .subtract(1, "days") //start时间默认获取昨天的日期
      .format("YYYY-MM-DD"),
    sleepEnd: moment(currentDay).format("YYYY-MM-DD")
  };

  const [input, setInput] = useState("");
  const [compValue, setCompValue] = useState([dayOption[name], time]);
  // [YYYY-MM-DD, 00:00] 数据结构，0位是日期，1位是时间
  function onInputChange(value) {
    let temp = compValue;
    temp[1] = value;
    setInput(value); //comp内部更新输入值，未来试试显示
    setCompValue(temp);
    onValue(temp); // 最后向上输出value
  }

  function onDateChange(e) {
    let value = e.detail.value;
    let temp = compValue;
    temp[0] = value;
    setCompValue(temp);
    onValue(temp);
  }

  return (
    <View className="sleepTimeView">
      <AtInput
        name={name}
        type="text"
        placeholder={title}
        value={input}
        onChange={value => onInputChange(value)}
      >
        <Picker mode="date" onChange={onDateChange}>
          <View>{compValue[0]}</View>
        </Picker>
      </AtInput>
    </View>
  );
};

export default SleepTime;
