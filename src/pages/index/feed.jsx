import React, { useState, useEffect } from "react";
import { View, Text, Button } from "@tarojs/components";
import {
  AtList,
  AtListItem,
  AtDivider,
  AtButton,
  AtCheckbox,
  AtSwipeAction
} from "taro-ui";
import moment from "moment";
import EmptyComp from "../../component/EmptyComp";
import { globalUrl } from "../../util/globalUrl";
import _ from "lodash";
import "./index.scss";

const typeThumb = {
  breast: globalUrl + "/breast.png",
  powder: globalUrl + "/bottle_mini.png",
  food: globalUrl + "/food.png"
};

const typeName = {
  breast: "母乳",
  powder: "奶粉",
  food: "辅食"
};

const FeedList = ({
  feedData,
  nextFeed,
  selectedDay,
  today,
  onItemClick,
  compLoading,
}) => {
  /**
   * 如果不是今天，不预计下顿时间
   * 时间做排序
   * 数组不符合条件不显示数据
   * 用最新的时间计算下顿时间
   */
  let isToday = selectedDay === today ? true : false;
  let newFeedData = null;
  if (feedData && _.isArray(feedData) && _.size(feedData) > 0) {
    newFeedData = feedData;
    newFeedData.sort((a, b) => {
      return a.time > b.time ? 1 : -1;
    });
  }

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
          {newFeedData.map((item, index) => {
            let newVolume = _.get(item, "volume", 0);

            return (
              <AtListItem
                title={item.time}
                note={newVolume !== 0 ? newVolume : null}
                extraText={typeName[item.type]}
                thumb={typeThumb[item.type]}
                onClick={() => onItemClick(index,item)}
              />
            );
          })}
          {isToday && (
            <AtListItem
              title={nextFeedTime}
              disabled
              extraText={"预计下顿时间"}
            />
          )}
        </AtList>
      </>
    );
  } else {
    return (
      <View className="emptyContentView">
        <EmptyComp loading={compLoading}/>
      </View>
    );
  }
};

export default FeedList;
