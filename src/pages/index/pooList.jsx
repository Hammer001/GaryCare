import React, { useState, useEffect } from "react";
import { View, Text, Button } from "@tarojs/components";
import { AtList, AtListItem, AtDivider, AtButton, AtCheckbox } from "taro-ui";
import { globalUrl } from "../../util/globalUrl";
import EmptyComp from "../../component/EmptyComp";
import _ from "lodash";
import "./index.scss";

const colorTagDot = [
  { name: "灰白", type: "greywhite", dotImg: globalUrl + "/color_tag_1.png" },
  { name: "绿色", type: "green", dotImg: globalUrl + "/color_tag_2.png" },
  { name: "黄色", type: "yellow", dotImg: globalUrl + "/color_tag_3.png" },
  { name: "褐色", type: "brown", dotImg: globalUrl + "/color_tag_4.png" },
  { name: "黑色", type: "black", dotImg: globalUrl + "/color_tag_5.png" },
  { name: "红色", type: "red", dotImg: globalUrl + "/color_tag_6.png" }
];

const PooList = ({ pooData, onItemClick, batchDel }) => {
  let newPooData = null;
  if (pooData && _.isArray(pooData) && _.size(pooData) > 0) {
    newPooData = pooData;
    newPooData.sort((a, b) => {
      return a.pootime > b.pootime ? 1 : -1;
    });
  }

  function renderColorDot(item) {
    let newIndex = _.findIndex(colorTagDot, o => {
      return o.name === item || o.type === item;
    });

    if (newIndex !== -1) {
      return colorTagDot[newIndex].dotImg;
    }
  }

  if (newPooData) {
    return (
      <>
        <AtList>
          {newPooData.map((item, i) => {
            const newTime = _.get(item, "time", null)
              ? item.time
              : _.get(item,'pootime','');
            return (
              <AtListItem
                title={newTime}
                thumb={renderColorDot(item.color)}
                extraText={item.shape}
                onClick={() => onItemClick(i,item)}
              />
            );
          })}
        </AtList>
      </>
    );
  } else {
    return (
      <View className="emptyContentView">
        <EmptyComp />
      </View>
    );
  }
};

export default PooList;
