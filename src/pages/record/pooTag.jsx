import React, { useState } from "react";
import { View } from "@tarojs/components";
import { AtTag } from "taro-ui";
import "./record.scss";

const PooTag = ({onSelect}) => {
  const [type, setType] = useState([
    { name: "一般", active: false },
    { name: "水样", active: false },
    { name: "很稀", active: false },
    { name: "粘稠", active: false },
    { name: "干硬", active: false }
  ]);

  function clickTag(index) {
    let newType = type.map(n => {
      return { ...n, active: false };
    });
    newType[index].active = true;
    setType(newType);
    onSelect(newType[index].name)
  }

  return (
    <View className="pooTag">
      {type.map((t, i) => (
        <View style="margin-right:25rpx">
          <AtTag size="small" active={t.active} onClick={() => clickTag(i)}>
            {t.name}
          </AtTag>
        </View>
      ))}
    </View>
  );
};

export default PooTag;
