import React, { useState, useEffect } from "react";
import { View, Text, Button } from "@tarojs/components";
import { AtList, AtListItem, AtDivider, AtButton, AtCheckbox } from "taro-ui";
import moment from "moment";
import EmptyComp from "../../component/EmptyComp";
import _ from "lodash";
import "./index.scss";

const FeedList = ({ feedData, nextFeed, selectedDay, today, batchDel }) => {
  const [mode, setMode] = useState(false);
  const [checkList, setCheckList] = useState([]);

  // 切换日历，feedData数据变化，将mode切换回查看模式。
  useEffect(() => {
    setMode(false);
    setCheckList([]);
    return () => {};
  }, [feedData]);

  /**
   * 如果不是今天，不预计下顿时间
   * 时间做排序
   * 数组不符合条件不显示数据
   * 用最新的时间计算下顿时间
   */
  let checkOption = [];
  let isToday = selectedDay === today ? true : false;
  let newFeedData = null;
  if (feedData && _.isArray(feedData) && _.size(feedData) > 0) {
    newFeedData = feedData;
    newFeedData.sort((a, b) => {
      return a.time > b.time ? 1 : -1;
    });
    checkOption = newFeedData.map(n => {
      return { label: n.time, value: n.key };
    });
  }

  function submit() {
    setMode(false);
    batchDel(checkList);
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
    if (newFeedData) {
      //避免空数据，有数据的时候再计算时间
      let newTimeStamp = selectedDay + " " + _.last(newFeedData)["time"];
      let nextFeedTime = nextFeed
        ? moment(newTimeStamp)
            .add(nextFeed, "hours")
            .calendar()
        : "请先设置喂奶间隔";

      return (
        <>
          <AtList>
            {newFeedData.map(item => {
              let newVolume = _.get(item, "volume", null)
                ? " | " + _.get(item, "volume", "") + "毫升"
                : "";
              let newTitle = item.time + newVolume; //
              return <AtListItem title={newTitle} extraText={item.type} />;
            })}
            {isToday && (
              <AtListItem
                title={nextFeedTime}
                disabled
                extraText={"预计下顿时间"}
              />
            )}
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

export default FeedList;
