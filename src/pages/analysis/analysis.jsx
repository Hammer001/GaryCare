import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Text, ScrollView, WebView } from "@tarojs/components";
import { AtCard, AtTimeline, AtDivider } from "taro-ui";
import moment from "moment";
import TitleComp from "../../component/TitleComp";
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
  food:'辅食'
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
    if (garyData && _.size(garyData) > 0) {
      convertTimeData = garyData.map(g => {
        return { ...g, timeStamp: moment(g.date).valueOf() };
      });
      // 将数据增加时间戳字段，并且排序，方便下面进行筛选
      convertTimeData.sort((a, b) => {
        return a.timeStamp > b.timeStamp ? 1 : -1;
      });
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
        <TagHeader tagChange={value => this.setState({ timeRange: value })} />

        {newConvertData.map(item => {
          let newItem = [];
          let rightComp = null;
          if (item.feed && item.poo && item.temperture) {
            newItem = _.concat(item.feed, item.poo, item.temperture); //合并成一个数组，方便排序和筛选
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
                obj.content = [f.volume + "ml"];
              }
            } else if (f.poo) {
              //排便
              obj.title = f.time;
              obj.content = ["排便"];
              obj.color = "yello";
            } else if (f.tempValue) {
              //温度
              obj.title = f.time;
              obj.content = [f.tempValue + "℃"];
              obj.color = "red";
            }

            return obj;
          });
        //   if (item.sleep) {
        //     let startTime = _.split(_.get(item.sleep, "start", ""), "/");
        //     let endTime = _.split(_.get(item.sleep, "end", ""), "/");
        //     rightComp = (
        //       <View className="at-col">
        //         <View>{startTime[0]}</View>
        //         <View>{endTime[1]}</View>
        //       </View>
        //     );
        //   }
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
