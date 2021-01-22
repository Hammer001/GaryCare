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

const PooList = ({ pooData, selectedDay, today, batchDel }) => {
  const [mode, setMode] = useState(false);
  const [checkList, setCheckList] = useState([]);

  useEffect(() => {
    setMode(false);
    setCheckList([]);
    return () => {};
  }, [pooData]);

  let checkOption = [];
  let newPooData = null;
  if (pooData && _.isArray(pooData) && _.size(pooData) > 0) {
    newPooData = pooData;
    newPooData.sort((a, b) => {
      return a.time > b.time ? 1 : -1;
    });
    checkOption = newPooData.map(n => {
      return { label: n.time, value: n.key };
    });
  }

  function submit() {
    setMode(false);
    batchDel(checkList);
  }

  function renderColorDot(item) {
    let newIndex = _.findIndex(colorTagDot, o => {
      return o.name === item || o.type === item;
    });

    if (newIndex !== -1) {
      return colorTagDot[newIndex].dotImg;
    }
  }

  if (mode) {
    return (
      <>
        <AtCheckbox
          options={checkOption}
          selectedList={checkList}
          onChange={value => setCheckList(value)}
        />

        <View className="delButtonView">
          <View className="submitButton">
            <AtButton type="secondary" onClick={() => submit()}>
              确定
            </AtButton>
          </View>
        </View>
      </>
    );
  } else {
    if (newPooData) {
      return (
        <>
          <AtList>
            {newPooData.map(item => {
              return (
                <AtListItem
                  title={item.time}
                  thumb={renderColorDot(item.color)}
                  extraText={item.shape}
                />
              );
            })}
          </AtList>
          <AtDivider lineColor="#f5f5f5">
            <View className="dividerButton" onClick={() => setMode(true)}>
              <Text style="color:#FF4949">点击删除</Text>
            </View>
          </AtDivider>
        </>
      );
    } else {
      return (
        <View className="emptyContentView">
          <EmptyComp />
        </View>
      );
    }
  }
};

export default PooList;
