import React from "react";
import { View } from "@tarojs/components";
import { AtList, AtListItem } from "taro-ui";
import _ from "lodash";
import EmptyComp from "../../component/EmptyComp";
import temp_high from "../../asserts/temp_high.png";
import temp_low from "../../asserts/temp_low.png";
import temp_abnormal from "../../asserts/temp_abnormal.png";
import temp_normal from "../../asserts/temp_normal.png";
import "./index.scss";

const levelObject = {
  high: { title: "偏高", color: "#ff4949", icon: temp_high },
  low: { title: "偏低", color: "#13ce66", icon: temp_low },
  normal: { title: "正常", color: "#78a4fa", icon: temp_normal },
  abnormal: { title: "异常", color: "#ffc82c", icon: temp_abnormal }
};

function tempLevel(temp) {
  let floatTemp = parseFloat(temp);
  if (floatTemp > 37.5 && floatTemp < 39) {
    return levelObject["high"];
  } else if (34 < floatTemp && floatTemp < 36) {
    return levelObject["low"];
  } else if (floatTemp > 39) {
    return levelObject["abnormal"];
  } else if (floatTemp <= 34) {
    return levelObject["abnormal"];
  } else {
    return levelObject["normal"];
  }
}

const TempertureList = ({ tempData, onItemClick }) => {
  if (tempData && _.isArray(tempData) && _.size(tempData) > 0) {
    return (
      <AtList>
        {tempData.map((item, i) => {
          const newTempValue = _.get(item, "tempValue", null)
            ? item.tempValue
            : item.temperture;
          const status = tempLevel(newTempValue);
          const newTime = _.get(item, "time", null)
            ? item.time
            : _.get(item, "tempTime", "");
          return (
            <AtListItem
              title={newTempValue + "℃"}
              extraText={_.get(status, "title", "")}
              thumb={_.get(status, "icon")}
              note={newTime}
              onClick={() => onItemClick(i,item)}
            />
          );
        })}
      </AtList>
    );
  } else {
    return (
      <View className="emptyContentView">
        <EmptyComp />
      </View>
    );
  }
};

export default TempertureList;
