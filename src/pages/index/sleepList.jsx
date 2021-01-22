import React, { useState, useEffect } from "react";
import { View, Text, Button } from "@tarojs/components";
import { AtList, AtListItem, AtDivider, AtButton, AtCheckbox } from "taro-ui";
import EmptyComp from "../../component/EmptyComp";
import moment from "moment";
import { globalUrl } from "../../util/globalUrl";
import _ from "lodash";
import "./index.scss";

const SleepList = ({ sleepList, selectedDay, today, batchDel }) => {
  const [mode, setMode] = useState(false);
  const [checkList, setCheckList] = useState([]);
  useEffect(() => {
    setMode(false);
    setCheckList([]);
    return () => {};
  }, [sleepList]);

  let checkOption = [];
  let newSleepData = null;
  if (sleepList && _.isArray(sleepList) && _.size(sleepList) > 0) {
    newSleepData = sleepList;
    newSleepData.sort((a, b) => {
      return a.time > b.time ? 1 : -1;
    });
    checkOption = newSleepData.map(n => {
      return { label: n.time, value: n.key };
    });
  }

  /**
   * PENDING
   * 删除功能未做：因check需要label和value，但是sleep数据start to end的数据过长，暂时隐藏
   * 删除功能实现可以讲value等于睡眠数据的key值
   */

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
    if (newSleepData) {
      return (
        <>
          <AtList>
            {newSleepData.map(item => {
              const newStart = _.replace(item.start, "/", " ");
              const newEnd = _.replace(item.end, "/", " ");
              const diff = moment(newStart).diff(moment(newEnd), "hours");
              return (
                <AtListItem
                  title={Math.abs(diff) + '小时'}
                  thumb={globalUrl + "/sleep_mini.png"}
                  note={newStart + " to " + newEnd}
                />
              );
            })}
          </AtList>
          {/* <AtDivider lineColor="#f5f5f5">
            <View className="dividerButton" onClick={() => setMode(true)}>
              <Text style="color:#FF4949">点击删除</Text>
            </View>
          </AtDivider> */}
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

export default SleepList;
