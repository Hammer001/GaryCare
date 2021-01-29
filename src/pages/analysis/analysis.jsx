import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Text, ScrollView, WebView } from "@tarojs/components";
import { AtCard, AtTimeline, AtDivider } from "taro-ui";
import moment from "moment";
import TitleComp from "../../component/TitleComp";
// import Charts from "../../component/Charts";
import TagHeader from "./tagHeader";
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
  }
  componentDidShow() {
    const { garyData } = this.props;
    let convertTimeData;
    let timeCache = { date: "", cache: [] };
    if (garyData && _.size(garyData) > 0) {
      //增加为分析页面用的数据，将睡眠数据拆开，区分昨天今天的时间线
      convertTimeData = _.reverse(garyData).map(g => {
        let gDate = g.date; // 拿到遍历数据的日期
        let gSleep = g.sleep;
        _.isArray(g.poo) && g.poo.map(p => (p.time = p.pootime)); // 遍历将不同名称的时间统一为time
        _.isArray(g.temperture) && g.temperture.map(t => (t.time = t.tempTime));
        g.extractSleep = [];
        if (gDate === timeCache.date) {
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
              timeCache.date = extraStartDate[0];
              timeCache.cache.push(startObj);
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
        return a.timeStamp > b.timeStamp ? 1 : -1;
      });

      console.log("convertTimeData", convertTimeData);
      this.setState({ allData: convertTimeData });
    }
  }
  handleMessage(e) {
    console.log(e);
  }
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
      //   <WebView
      //     src="https://alphaworkout.z23.web.core.windows.net/#/login"
      //     onMessage={this.handleMessage}
      //   />
      <ScrollView scrollY scrollWithAnimation className="container">
        {/* <Charts /> */}

        <TagHeader tagChange={value => this.setState({ timeRange: value })} />

        {newConvertData.map(item => {
          let newItem = [];
          let rightComp = null;
          let pooCount = 0;
          let feedCount = 0;
          let minCount = 0;
          let hourCount = 0;
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
              obj.color = "green";
              if (f.volume) {
                obj.content = [f.volume];
              }
              feedCount++; // 计算喂养次数
            } else if (f.poo) {
              //排便
              obj.title = f.time;
              obj.content = ["排便"];
              obj.color = "yello";
              pooCount++; // 计算排便次数
            } else if (f.tempValue) {
              //温度
              obj.title = f.time;
              obj.content = [f.tempValue + "℃"];
              obj.color = "red";
            } else if (f.sleep) {
              //睡眠
              obj.title = f.time;
              obj.content = [f.name];
              obj.color = "blue";

              let fStart = _.replace(f.start, "/", " ");
              let fEnd = _.replace(f.end, "/", " ");
              let diffHours = moment(fStart).diff(moment(fEnd), "hours");
              let diffMin = moment(fStart).diff(moment(fEnd), "minute");
              if (Math.abs(diffHours) < 1) {
                minCount = minCount + diffMin;
              } else {
                hourCount = hourCount + diffHours;
              }
            }

            return obj;
          });

          rightComp = (
            <View className="at-col rightContainer">
              {feedCount !== 0 && (
                <View className="rightComp">
                  <View className="countContent">喂养次数</View>
                  <View className="countText">{feedCount}</View>
                </View>
              )}

              {pooCount !== 0 && (
                <View className="rightComp">
                  <View className="countContent">排便次数</View>
                  <View className="countText">{pooCount}</View>
                </View>
              )}

              {/* {hourCount !== 0 || minCount!==0 ? (
                <View className="rightComp">
                  <View className="countContent">睡眠时长</View>
                  <View className="countText">{pooCount}</View>
                </View>
              ):null} */}
            </View>
          );

          return (
            <View className="cardView">
              <AtCard
                note={item.note || null}
                title={item.date}
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
