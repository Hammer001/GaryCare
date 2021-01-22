import React, { useState } from "react";
import { View } from "@tarojs/components";
import "./record.scss";

const ColorTag = ({ onSelect }) => {
  const [type, setType] = useState([
    { name: "灰白", type: "greywhite", active: false, color: "#efedee" },
    { name: "绿色", type: "green", active: false, color: "#b5e695" },
    { name: "黄色", type: "yellow", active: false, color: "#fedd5a" },
    { name: "褐色", type: "brown", active: false, color: "#bf8b5c" },
    { name: "黑色", type: "black", active: false, color: "#0e0808" },
    { name: "红色", type: "red", active: false, color: "#f77d7c" }
  ]);

  function clickTag(index) {
    let newType = type.map(n => {
      return { ...n, active: false };
    });
    newType[index].active = true;
    setType(newType);
    onSelect(newType[index].type);
  }

  const renderStyle = (active, color) => {
    let hasActive = active ? "border:1rpx solid black" : "";
    let background = "background-color:" + color;
    return background + ";" + hasActive;
  };

  const renderFontStyle = acitve => {
    return acitve ? "color:black;" : "color:#6b6b6b;";
  };
  return (
    <View className="at-row colorTagView">
      {type.map((t, i) => (
        <View className=" at-col colorTag" onClick={() => clickTag(i)}>
          <View className="color" style={renderStyle(t.active, t.color)}></View>
          <View className="colorName" style={renderFontStyle(t)}>
            {t.name}
          </View>
        </View>
      ))}
    </View>
  );
};

export default ColorTag;
