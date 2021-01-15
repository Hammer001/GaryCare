import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Text } from "@tarojs/components";
// import { WeekSwiper } from 'taro-week-swiper'
import {
  AtCalendar,
  AtTabs,
  AtTabsPane,
  AtButton,
  AtActionSheet,
  AtActionSheetItem,
  AtIcon
} from "taro-ui";
import { getToday } from "../../util/timeUtil";
import {
  setGaryData,
  setSelectDay,
  changeDataUpdateStatus
} from "../../actions/gary";
import { findDateIndex } from "../../util/findDateIndex";
import moment from "moment";
import { showToast } from "../../util/toastUtil";
import FeedList from "./feed";
import TempertureList from "./temperture";
import NoteTab from "./noteTab";
import _ from "lodash";
import "./index.scss";
/**
 * 当前数据结构：
 * gary-care:
 * [{date:'2021-01-14',feed:[{key:0,time:12:00,type:'',volume:150}],temperture:[37,36],note:''}]
 */

function isEmptyString(value) {
  if (value == "undefined" || !value || !/[^\s]/.test(value)) {
    return true;
  } else {
    return false;
  }
}

class Index extends Component {
  //   config = {
  //     usingComponents: {
  //       weekSwiper: "../../component/WeekSwiper"
  //     }
  //   };

  constructor(props) {
    super(props);
    this.state = {
      tab: 0,
      currentDay: null,
      duration: null,
      actionOpen: false,
      markDate: []
    };
    this.today = getToday();
  }

  componentDidShow(options) {
    // console.log("index：进入小程序", options);
    if (this.props.isUpdate) {
      //每次进入该页面，检查是否需要更新
      this.updateFromStorage();
    }
  }

  componentDidMount() {
    this.updateFromStorage();
    this.props.updateSelectDay(this.today);
    this.setState({
      currentDay: this.today
    });
  }

  updateFromStorage = () => {
    // 更新care数据，以及喂奶间隔
    Taro.getStorage({
      key: "gary-care",
      success: res => {
        let getData = _.get(res, "data", null);
        let newMarkArray = [];
        getData && // 删除空数据，或者把曾经某一天的数据全删了，也会清空当天的记录。
          _.remove(getData, r => {
            return (
              _.size(r.feed) === 0 &&
              _.size(r.temperture) === 0 &&
              isEmptyString(r.note)
            );
          });
        getData &&
          getData.map(n => {
            if (!isEmptyString(n.note)) {
              newMarkArray.push(n.date);
            }
          });

        // console.log("newMarkArray", newMarkArray);
        this.setState({
          feedData: getData,
          markDate: newMarkArray
        });
        this.props.updateGaryData(getData);
      }
    });

    Taro.getStorage({
      key: "gary-duration",
      success: res => {
        const getData = _.get(res, "data", null);
        this.setState({
          duration: getData
        });
      }
    });

    this.props.changeUpdateStatus(false); //更新完数据将更新状态修改为false
  };

  onTabChange(value) {
    this.setState({
      tab: value
    });
  }

  onCalendarChange({ value }) {
    this.setState({ currentDay: value });
    this.props.updateSelectDay(value);
  }

  onLongPressCalendar({ value }) {
    this.setState({ currentDay: value });
    this.props.updateSelectDay(value);
    this.handleActionSheet(true);
  }

  goInput = () => {
    Taro.navigateTo({ url: "/pages/record/record" });
  };

  handleBatchDeleteFeed = (list, index) => {
    const { feedData, currentDay } = this.state;
    let newFeedData = feedData;
    let feedList = _.get(feedData[index], "feed");
    if (_.isArray(list) && _.size(list) > 0) {
      list.map(item => {
        _.remove(feedList, r => r.key === item);
      });

      newFeedData[index].feed = feedList;

      Taro.setStorage({
        key: "gary-care",
        data: newFeedData,
        success: res => {
          //   console.log(res);
          this.updateFromStorage();
          showToast("删除成功！", "success", 2000);
        }
      });
    }
  };

  handleActionSheet = status => {
    if (status === 1) {
      Taro.navigateTo({ url: "/pages/note/note" });
      this.setState({ actionOpen: false });
    } else {
      this.setState({ actionOpen: status });
    }
  };

  render() {
    const {
      tab,
      feedData,
      currentDay,
      duration,
      actionOpen,
      markDate
    } = this.state;
    const tabList = [
      { title: "喂奶" },
      { title: "体温" },
      { title: "星标笔记" }
    ];
    const dateIndex = findDateIndex(feedData, currentDay);
    const currentData = dateIndex !== -1 ? feedData[dateIndex] : null;
    // diff3 记录今天与选择的天数的差距，0是当天，负数是未来的天数，正数是过去的天数
    // const diff3 = moment(this.today).diff(moment(currentDay), "days");
    // console.log("diff3", diff3);
    // console.log("markDate", markDate);
    return (
      <View className="container">
        <View className="calendarView">
          <AtCalendar
            format="YYYY-MM-DD"
            marks={markDate}
            onDayClick={value => this.onCalendarChange(value)}
            onDayLongClick={value => this.onLongPressCalendar(value)}
          />

          <View className="inputButton">
            <AtButton
              type="primary"
              size="small"
              circle
              onClick={() => this.goInput()}
            >
              <AtIcon value="add-circle" size="16"></AtIcon>
              <Text style="marign-left:7rpx;"> 记录宝宝的日常</Text>
            </AtButton>
          </View>
        </View>

        <View className="tabView">
          <AtTabs
            current={tab}
            tabList={tabList}
            onClick={this.onTabChange.bind(this)}
          >
            <AtTabsPane current={tab} index={0}>
              <View className="tabPanelView">
                <FeedList
                  feedData={_.get(currentData, "feed", null)}
                  nextFeed={duration}
                  selectedDay={currentDay}
                  today={this.today}
                  batchDel={list => this.handleBatchDeleteFeed(list, dateIndex)}
                />
              </View>
            </AtTabsPane>
            <AtTabsPane current={tab} index={1}>
              <View className="tabPanelView">
                <TempertureList
                  tempData={_.get(currentData, "temperture", null)}
                />
              </View>
            </AtTabsPane>
            <AtTabsPane current={tab} index={2}>
              <View className="tabPanelView">
                <NoteTab
                  noteData={_.get(currentData, "note", "")}
                  goEdit={() => Taro.navigateTo({ url: "/pages/note/note" })}
                  isEmptyContent={isEmptyString(_.get(currentData, "note", ""))}
                />
              </View>
            </AtTabsPane>
          </AtTabs>
        </View>

        <AtActionSheet
          isOpened={actionOpen}
          cancelText="取消"
          onCancel={() => this.handleActionSheet(false)}
          onClose={() => this.handleActionSheet(false)}
        >
          <AtActionSheetItem onClick={() => this.handleActionSheet(1)}>
            星标笔记
          </AtActionSheetItem>
          {/* <AtActionSheetItem>按钮二</AtActionSheetItem> */}
        </AtActionSheet>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    garyData: state.gary.garyData,
    selectDay: state.gary.selectDay,
    isUpdate: state.gary.isDataUpate
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateGaryData: data => {
      dispatch(setGaryData(data));
    },
    updateSelectDay: data => {
      dispatch(setSelectDay(data));
    },
    changeUpdateStatus: status => {
      dispatch(changeDataUpdateStatus(status));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
