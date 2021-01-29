import React, { useState, useEffect } from "react";
import { View, Text, Button } from "@tarojs/components";
import { AtList, AtListItem, AtDivider, AtButton, AtCheckbox } from "taro-ui";
import EmptyComp from "../../component/EmptyComp";
import moment from "moment";
import { globalUrl } from "../../util/globalUrl";
import _ from "lodash";
import "./index.scss";

const SleepList = ({ sleepList, onItemClick, batchDel }) => {
  let newSleepData = null;
  if (sleepList && _.isArray(sleepList) && _.size(sleepList) > 0) {
    newSleepData = sleepList;
    newSleepData.sort((a, b) => {
      return a.key > b.key ? 1 : -1;
    });
  }

  if (newSleepData) {
    return (
      <>
        <AtList>
          {newSleepData.map((item, i) => {
            const newStart = _.replace(item.start, "/", " ");
            const newEnd = _.replace(item.end, "/", " ");
            const diff = moment(newStart).diff(moment(newEnd), "hours");
            return (
              <AtListItem
                title={Math.abs(diff) + "小时"}
                thumb={globalUrl + "/sleep_mini.png"}
                note={newStart + " to " + newEnd}
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

export default SleepList;
