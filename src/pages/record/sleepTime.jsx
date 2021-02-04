import React, { useState, useEffect } from "react";
import { View, Picker } from "@tarojs/components";
import { AtDivider } from "taro-ui";
import moment from "moment";
import "./record.scss";

const SleepTime = ({
  name,
  currentDay,
  time,
  title,
  timeMode,
  isEdit,
  onValue
}) => {
  const dayOption = {
    lastDay: moment(currentDay)
      .subtract(1, "days") //start时间默认获取昨天的日期
      .format("YYYY-MM-DD"),
    today: moment(currentDay).format("YYYY-MM-DD")
  };
  const colorOption = {
    sleepStart: "color:#607d8b;",
    sleepEnd: "color:#424143;"
  };

  const [input, setInput] = useState("");
  const [compValue, setCompValue] = useState(["", ""]);

  useEffect(() => {
    const getTime = time[1];
    const getDate = time[0];
    if (isEdit) {
      setInput(getTime);
      setCompValue([getDate, getTime]);
    } else {
      if (timeMode === "lastnight") {
        setCompValue([dayOption["lastDay"], getTime]);
      } else {
        setCompValue([dayOption["today"], getTime]);
      }
    }

    return () => {};
  }, [timeMode]);

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
    <View
      className="at-row sleepTimeView"
      style={name === "sleepStart" && isEdit ? "padding-top:30rpx" : ""}
    >
      <View className="at-col at-col-8">
        <Picker
          mode="time"
          onChange={e => onInputChange(e.detail.value)}
          value={input}
        >
          {/* <AtList>
            <AtListItem title="请选择时间" extraText={input} />
          </AtList> */}
          <View className="timeItem" style={colorOption[name]}>
            {input === "" ? title : input}
          </View>
        </Picker>
      </View>

      <View className="at-col at-col-4">
        <Picker mode="date" onChange={onDateChange}>
          <View className="timeItem" style={colorOption[name]}>
            {compValue[0]}
          </View>
        </Picker>
      </View>
      {/* <AtInput
        name={name}
        type="text"
        placeholder={title}
        value={input}
        onChange={value => onInputChange(value)}
      ></AtInput> */}
    </View>
  );
};

export default SleepTime;
