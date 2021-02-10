import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Text, ScrollView, WebView } from "@tarojs/components";
import { AtCard, AtDivider, AtIcon, AtMessage } from "taro-ui";
import moment, { duration } from "moment";
import { getToday, getYesterday } from "../../util/timeUtil";
import AtTimeline from "../../component/NewTimeline";
// import Charts from "../../component/Charts";
import TagHeader from "../../component/TagHeader";
import { globalUrl } from "../../util/globalUrl";
import _ from "lodash";
import "./analysis.scss";

const time_range = {
  weeks: moment()
    .subtract(1, "weeks")
    .valueOf(),
  month: moment()
    .subtract(1, "month")
    .valueOf()
};

const typeName = {
  breast: "母乳",
  powder: "奶粉",
  food: "辅食"
};

class Analysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allData: [],
      timeRange: "all"
    };
    this.today = getToday();
    this.yesterday = getYesterday();
  }
  componentDidShow() {
    const { garyData } = this.props;
    let convertTimeData;
    let timeCache = { date: "", cache: [] };
    if (garyData && _.size(garyData) > 0) {
      //增加为分析页面用的数据，将睡眠数据拆开，区分昨天今天的时间线
      convertTimeData = _.reverse(_.cloneDeep(garyData)).map(g => {
        let gDate = g.date; // 拿到遍历数据的日期
        let gSleep = g.sleep;
        _.isArray(g.poo) && g.poo.map(p => (p.time = p.pootime)); // 遍历将不同名称的时间统一为time
        _.isArray(g.temperture) && g.temperture.map(t => (t.time = t.tempTime));
        g.extractSleep = [];
        if (gDate === timeCache.date) {
          //【cache】: 当前日期gDate等于cache的日期，将数据加入extractSleep，数据会加入到前一天的数据中
          g.extractSleep = [...timeCache.cache];
          timeCache.cache = [];
        }
        if (_.isArray(gSleep) && _.size(gSleep) > 0) {
          gSleep.map(s => {
            let extraStartDate = _.split(s.start, "/");
            let extraEndDate = _.split(s.end, "/");
            let startObj = {
              key: s.start,
              sleep: true,
              time: extraStartDate[1],
              name: "(=-ω-)zzZ)[睡觉啦！]"
            };
            let endObj = {
              key: s.end,
              sleep: true,
              time: extraEndDate[1],
              name: "(o￣ω￣)○))[起床啦!]"
            };
            if (extraStartDate[0] === gDate) {
              g.extractSleep.push(startObj);
            } else {
              timeCache.date = extraStartDate[0]; // 如果该条数据不等于gDate，将它保存在cache里面
              timeCache.cache.push(startObj); // 下次再遍历的时候可以，可以执行【cache】
            }
            if (extraEndDate[0] === gDate) {
              g.extractSleep.push(endObj);
            } else {
              timeCache.date = extraStartDate[0];
              timeCache.cache.push(endObj);
            }
          });
        }
        return { ...g, timeStamp: moment(g.date).valueOf() };
      });
      // 将数据增加时间戳字段，并且排序，方便下面进行筛选
      convertTimeData.sort((a, b) => {
        return a.timeStamp > b.timeStamp ? -1 : 1;
      });

      console.log("convertTimeData", convertTimeData);
      this.setState({ allData: convertTimeData });
    }
  }
  handleMessage(e) {
    console.log(e);
  }
  renderCardExtra = date => {
    if (date === this.today) {
      return "今天";
    } else if (date === this.yesterday) {
      return "昨天";
    } else {
      return null;
    }
  };
  render() {
    const { allData, timeRange } = this.state;
    let newConvertData;
    if (timeRange === "all") {
      newConvertData = allData;
    } else {
      newConvertData = allData.filter(f => {
        return f.timeStamp > time_range[timeRange];
      });
    }
    return (
      <ScrollView scrollY scrollWithAnimation className="container">
        {/* <Charts /> */}

        <View className="at-row at-row__justify--between">
          <View className="at-col at-col-8">
            {" "}
            <TagHeader
              size="normal"
              page="analysis"
              tagChange={value => this.setState({ timeRange: value })}
              tagData={[
                { key: 0, keyName: "all", text: "全部", active: true },
                { key: 1, keyName: "weeks", text: "近一周", active: false },
                { key: 2, keyName: "month", text: "近一月", active: false }
              ]}
            />
          </View>
          <View
            className="at-col at-col-2"
            style="text-align:center;padding-top:30rpx"
          >
            <AtIcon
              value="help"
              size="18"
              color="#9e9e9e"
              onClick={() => {
                Taro.atMessage({
                  message:
                    "昨晚睡眠时长 根据7点之前的入睡时间计算; 如前一天12点前睡醒，算作昨日睡眠数据",
                  // 'type': type,
                  duration: 5000
                });
              }}
            ></AtIcon>
          </View>
        </View>

        {newConvertData.map(item => {
          let newItem = [];
          let rightComp = null; //卡片右侧部分统计模块
          let pooCount = 0;
          let feedCount = 0;
          let minCount = 0; //分钟计算
          let hourCount = 0; //小时计算
          let isLastDay = false; // 计算是否有昨天的睡眠
          let lastDayHourCount = 0;
          let lastDayMinCount = 0;
          let lastDayNewTime;
          let newTime; //渲染最好带'分钟、小时'的字符串
          if (item.feed && item.poo && item.temperture && item.extractSleep) {
            newItem = _.concat(
              item.feed,
              item.poo,
              item.temperture,
              item.extractSleep
            ); //合并成一个数组，方便排序和筛选
          }

          newItem.sort((a, b) => {
            return a.time > b.time ? 1 : -1;
          });
          let timeLineArray = newItem.map(f => {
            let obj = {};
            if (f.type) {
              //喂奶
              obj.title = f.time + " - " + typeName[f.type];
              obj.color = "#ff7fab";
              if (f.volume) {
                obj.content = [f.volume];
              }
              feedCount++; // 计算喂养次数
            } else if (f.poo) {
              //排便
              obj.title = f.time;
              obj.content = ["排便"];
              obj.color = "#ffd700";
              pooCount++; // 计算排便次数
            } else if (f.tempValue) {
              //温度
              obj.title = f.time;
              obj.content = [f.tempValue + "℃"];
              obj.color = "#1de9b6";
            } else if (f.sleep) {
              //睡眠
              obj.title = f.time;
              obj.content = [f.name];
              obj.color = "#95e8f3";
            }

            return obj;
          });

          _.isArray(item.sleep) && // 计算睡眠时长
            item.sleep.map(s => {
              /**
               * 计算小时和分钟数，如果少于1小时，显示分钟
               * 如果大于1小时则显示小时+分钟，分钟用余数表示
               */
              let startDate = _.split(s.start, "/")[0];
              let endDate = _.split(s.end, "/")[0];
              let sStart = _.replace(s.start, "/", " ");
              let sEnd = _.replace(s.end, "/", " ");
              let diffDay = Math.abs(
                moment(startDate).diff(moment(endDate), "day")
              );
              let diffHours = moment(sStart).diff(moment(sEnd), "hours");
              let diffMin = moment(sStart).diff(moment(sEnd), "minute");
              let diffHoursBeforeSevenClock = moment(sStart).diff(
                moment(endDate + " 07:00"),
                "hours"
              );
              let diffMinBeforeSevenClock = moment(sStart).diff(
                moment(endDate + " 07:00"),
                "minute"
              );
              // 以7点为结束计算时间，在此之前都算作昨晚睡眠
              // diffHoursBeforeSevenClock 为负数的时候，说明是在当日7点之前
              if (
                diffDay === 1 ||
                diffHoursBeforeSevenClock < 0 ||
                diffMinBeforeSevenClock < 0
              ) {
                isLastDay = true;
                lastDayMinCount = lastDayMinCount + Math.abs(diffMin);
                lastDayHourCount = lastDayHourCount + Math.abs(diffHours);
              } else {
                minCount = minCount + Math.abs(diffMin);
                hourCount = hourCount + Math.abs(diffHours);
              }
            });

          if (hourCount > 0) {
            newTime = hourCount + "小时" + (minCount % 60) + "分钟";
          } else {
            newTime = minCount + "分钟";
          }

          if (lastDayHourCount > 0) {
            lastDayNewTime =
              lastDayHourCount + "小时" + (lastDayMinCount % 60) + "分钟";
          } else {
            lastDayNewTime = lastDayMinCount + "分钟";
          }

          rightComp = (
            <View className="at-col rightContainer">
              {feedCount !== 0 && (
                <View className="rightComp">
                  <View className="countContent">喂养次数:</View>
                  <View className="countText">{feedCount}次</View>
                </View>
              )}

              {pooCount !== 0 && (
                <View className="rightComp">
                  <View className="countContent">排便次数:</View>
                  <View className="countText">{pooCount}次</View>
                </View>
              )}

              {minCount > 0 || hourCount > 0 ? (
                <View className="rightComp">
                  <View className="countContent">今日睡眠时长:</View>
                  <View className="countText" style="font-size:45rpx">
                    {newTime}
                  </View>
                </View>
              ) : null}

              {isLastDay ? (
                <View className="rightComp">
                  <View className="countContent">昨晚睡眠时长:</View>
                  <View className="countText" style="font-size:45rpx">
                    {lastDayNewTime}
                  </View>
                </View>
              ) : null}
            </View>
          );

          return (
            <View className="cardView">
              <AtCard
                note={item.note || null}
                title={item.date}
                extra={this.renderCardExtra(item.date)}
                thumb={globalUrl + "/calendar_color.png"}
              >
                <View className="at-row">
                  <View className="at-col">
                    <AtTimeline items={timeLineArray}></AtTimeline>
                  </View>
                  {rightComp}
                </View>
              </AtCard>
            </View>
          );
        })}
        <AtDivider content="没有更多了" />
        <AtMessage />
      </ScrollView>
    );
  }
}

const mapStateToProps = state => {
  return {
    garyData: state.gary.garyData
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //   updateGaryData: data => {
    //     dispatch(setGaryData(data));
    //   },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Analysis);
