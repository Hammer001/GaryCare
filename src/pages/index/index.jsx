import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Text, ScrollView } from "@tarojs/components";
// import { WeekSwiper } from 'taro-week-swiper'
import {
  AtCalendar,
  AtTabs,
  AtTabsPane,
  AtButton,
  AtActionSheet,
  AtActionSheetItem,
  AtIcon,
  AtActivityIndicator
} from "taro-ui";
import { getToday } from "../../util/timeUtil";
import {
  setGaryData,
  setSelectDay,
  changeDataUpdateStatus,
  changeUserData,
  changeGlobalCustom
} from "../../actions/gary";
import { findDateIndex } from "../../util/findDateIndex";
import { showToast } from "../../util/toastUtil";
import moment from "moment";
import FeedList from "./feed";
import TempertureList from "./temperture";
import NoteTab from "./noteTab";
import PooList from "./pooList";
import SleepList from "./sleepList";
import { newRequest } from "../../util/requestUtil";
import { isEmptyString } from "../../util/isEmptyString";
import { globalUrl } from "../../util/globalUrl";
import _ from "lodash";
import "./index.scss";
/**
 * 当前数据结构：
 * gary-care:
 * [{date:'2021-01-14',feed:[{key:0,time:12:00,type:'',volume:150}],temperture:[37,36],note:''}]
 */

class Index extends Component {
  config = {
    usingComponents: {
      weekSwiper: "../../component/WeekSwiper"
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      tab: 0,
      currentDay: null,
      duration: null,
      actionOpen: false,
      markDate: [],
      userId: null,
      refresh: false,
      editActon: {},
      pageLoading: false
    };
    this.today = getToday();
    this.timer;
  }

  onShareAppMessage(res) {
    return {
      title: "GaryCare",
      path: "/pages/login/login",
      imageUrl: globalUrl + "/GaryCareLogo2.png",
      success: function(res) {
        // 转发成功
        console.log("转发成功", res);
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败", res);
      }
    };
  }

  componentDidShow(options) {
    if (_.get(this.props, "isUpdate.data")) {
      this.getDataFromServer();
    }
  }

  componentDidMount() {
    this.initialUserEnterPage();
    // this.updateFromStorage();
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  componentDidHide() {
    this.timer && clearTimeout(this.timer);
  }

  initialUserEnterPage() {
    // this.getUserId();
    this.props.updateSelectDay(this.today);
    this.setState({
      currentDay: this.today
    });
    //this.props.changeUserLoginStatus(false); //用户重新登录完进行将状态改为false
  }

  getDataFromServer = () => {
    const { userData, garyData } = this.props;
    // console.log("index：进入小程序", options);

    if (_.get(userData, "_id", null)) {
      this.setState({
        pageLoading: true
      });

      let params = {
        _id: userData._id
      };
      newRequest("/get/user/data", params).then(data => {
        console.log("获取data");
        let getData = _.get(data, "callback.data", []);
        let getCustom = _.get(data, "callback.custom", null);
        let getError = _.get(data, "error", null);
        if (getError) {
          this.wrongDataAndLogout();
          return; // 出错直接return，不继续
        }
        if (getCustom) {
          // 2.0.8修改
          let getDurationNumber = _.split(_.get(getCustom, "duration"), "")[0];
          let formatDuration = _.isNumber(Number(getDurationNumber))
            ? Number(getDurationNumber) // volumePicker传出来的格式是'3小时'，不再是单一数字了，需要转换
            : 0;
        //   console.log("formatDuration", formatDuration);

          this.setState({
            duration: formatDuration
          });

          this.props.changeGlbCustom(getCustom); //全局将custom所以数据传进去
        }

        Taro.setStorage({
          key: "gary-care",
          data: getData
        });

        this.setState({
          feedData: getData,
          pageLoading: false
        });

        this.props.updateGaryData(getData);
      });
    } else {
      showToast("请重新登录！", "none", 3000);
      this.wrongDataAndLogout();
    }

    this.props.changeUpdateStatus({ data: false });
  };

  wrongDataAndLogout = () => {
    /**
     * 避免出现意外错误，index页面增加登出操作
     */
    Taro.removeStorage({
      key: "gary-care",
      success: function(res) {
        console.log("登出清除gary-care");
      }
    });

    Taro.removeStorage({
      key: "user",
      success: res => {
        //redux清空数据
        console.log("登出清除user");
      }
    });
    this.props.changeUserData({});
    this.props.updateGaryData([]);
    //this.props.changeUpdateStatus({ login: false, data: false });
    Taro.redirectTo({ url: "/pages/login/login" });
  };

  onTabChange(value) {
    this.setState({
      tab: value
    });
  }

  onCalendarChange({ value }) {
    console.log(value);
    this.setState({ currentDay: value });
    this.props.updateSelectDay(value);
  }

  //   onLongPressCalendar({ value }) {
  //     this.setState({ currentDay: value });
  //     this.props.updateSelectDay(value);
  //     this.setState(true);
  //   }

  onScroll(e) {
    console.log(e.detail);
  }

  onPullDownRefresh() {
    Taro.showNavigationBarLoading();

    this.timer = setTimeout(() => {
      if (_.get(this.props, "userData._id", null)) {
        let params = {
          _id: this.props.userData._id
        };
        newRequest("/get/user/data", params).then(data => {
          console.log("刷新获取");
          let getData = _.get(data, "callback.data", []);
          Taro.setStorage({
            key: "gary-care",
            data: getData
          });

          this.setState({
            feedData: getData
          });

          this.props.updateGaryData(getData);
          this.props.changeUpdateStatus({ data: false });
        });
      }
      Taro.stopPullDownRefresh();
      Taro.hideNavigationBarLoading();
    }, 500);
  }

  goInput = (type, index, dataIndex) => {
    const tabIndex = _.isNumber(index) ? "&tabIndex=" + index : ""; //跳转后显示那个tab的数据
    const newDataIndex = _.isNumber(dataIndex) ? "&dataIndex=" + dataIndex : ""; // 所点击的item所在数据中的index
    const newUrl = "?type=" + type + tabIndex + newDataIndex;
    Taro.navigateTo({
      url: "/pages/record/record" + newUrl
    });
  };

  handleItemDelete = dateIndex => {
    /**
     * 删除功能
     * 2.0.3 取消批量删除功能，点击不同的item可以删除或者跳转
     * 统一通过editAction进行数据管理
     */
    const { feedData, editActon } = this.state;
    let newFeedData = feedData; // 代表当前日期的所有数据，根据key值找到对应的对象数据
    let getType = _.get(editActon, "type");
    let getCurrentItem = _.get(editActon, "itemData", null);
    let currentList = _.get(feedData[dateIndex], getType);

    if (getCurrentItem) {
      this.setState({
        pageLoading: true
      });

      _.remove(currentList, r => r.key === getCurrentItem.key);

      newFeedData[dateIndex][getType] = currentList;

      if (_.get(this.props, "userData._id", null)) {
        let params = {
          _id: this.props.userData._id,
          data: newFeedData
        };
        newRequest("/update/user/data", params).then(data => {
          let isError = _.get(data, "error");
          if (!isError) {
            this.getDataFromServer();
            this.handleActionSheet(false, "", 0, 0, null);
            showToast("删除成功！", "success", 2000);
          }
        });
      }
    }
  };

  handleItemEdit = () => {
    const { editActon } = this.state;
    /**
     * 将点击列表的item作为集中管理，每次点击会更新editAction
     * 保存item的所在的数据type，tab所在的index值，item在list里面的index，还有item的数据
     * 符合条件进行跳转
     */
    if (
      _.get(editActon, "type") !== "" &&
      _.get(editActon, "visible") === true
    ) {
      this.goInput(editActon.type, editActon.index, editActon.dataIndex);
      this.handleActionSheet(false, "", 0, 0, null);
    }
  };

  handleActionSheet = (visible, type, index, dataIndex, itemData) => {
    this.setState({
      editActon: { visible, type, index, dataIndex, itemData }
    });
  };

  render() {
    const {
      tab,
      feedData,
      currentDay,
      duration,
      actionOpen,
      markDate,
      editActon,
      pageLoading
    } = this.state;
    const tabList = [
      { title: "喂奶" },
      { title: "排便" },
      { title: "睡眠" },
      { title: "体温" },
      { title: "笔记" }
    ];
    const dateIndex = findDateIndex(feedData, currentDay);
    const currentData = dateIndex !== -1 ? feedData[dateIndex] : null;
    // diffDay 记录今天与选择的天数的差距，0是当天，负数是未来的天数，正数是过去的天数
    const diffDay = moment(this.today).diff(moment(currentDay), "days");
    const recordButtonDisable = diffDay < 0 || pageLoading ? true : false;
    // console.log("diff3", diff3);
    // console.log("markDate", markDate);
    return (
      <ScrollView
        className="container"
        scrollY
        scrollIntoView="tabView"
        enableBackToTop={true}
        // refresherEnabled
        // refresherTriggered={this.state.refresh}
        // onRefresherRefresh={e => this.handleRefreshing(e)}
      >
        {/* <ScrollView scrollY onScroll={this.onScroll}  scrollWithAnimation style='height:100vh'> */}
        <View className="calendarView">
          <AtCalendar
            currentDate={currentDay}
            format="YYYY-MM-DD"
            marks={markDate}
            onDayClick={value => this.onCalendarChange(value)}
            // onDayLongClick={value => this.onLongPressCalendar(value)}
          />

          {/* <weekSwiper /> */}

          <View className="inputButton">
            <AtButton
              type="primary"
              size="small"
              circle
              onClick={() => this.goInput(tab)}
              disabled={recordButtonDisable}
              loading={pageLoading}
            >
              <AtIcon value="add-circle" size="16"></AtIcon>
              <Text style="marign-left:7rpx;"> 记录宝宝的日常</Text>
            </AtButton>
            <View
              className="backToday" //直接setState会导致全局没有更新数据，记录时会不更新时间
              onClick={() => this.onCalendarChange({ value: this.today })}
            >
              {diffDay !== 0 && "返回今天"}
            </View>
          </View>
        </View>

        <View id="tabView" className="tabView">
          <AtTabs
            current={tab}
            scroll
            tabList={tabList}
            onClick={this.onTabChange.bind(this)}
          >
            <AtTabsPane current={tab} index={0}>
              <View className="tabPanelView">
                <FeedList
                  compLoading={pageLoading}
                  feedData={_.get(currentData, "feed", null)}
                  nextFeed={duration}
                  selectedDay={currentDay}
                  today={this.today}
                  onItemClick={(dataIndex, itemData) =>
                    this.handleActionSheet(true, "feed", 0, dataIndex, itemData)
                  }
                />
              </View>
            </AtTabsPane>
            <AtTabsPane current={tab} index={1}>
              <View className="tabPanelView">
                <PooList
                  compLoading={pageLoading}
                  pooData={_.get(currentData, "poo", "")}
                  selectedDay={currentDay}
                  today={this.today}
                  onItemClick={(dataIndex, itemData) =>
                    this.handleActionSheet(true, "poo", 1, dataIndex, itemData)
                  }
                />
              </View>
            </AtTabsPane>
            <AtTabsPane current={tab} index={2}>
              <View className="tabPanelView">
                <SleepList
                  compLoading={pageLoading}
                  sleepList={_.get(currentData, "sleep", "")}
                  selectedDay={currentDay}
                  today={this.today}
                  onItemClick={(dataIndex, itemData) =>
                    this.handleActionSheet(
                      true,
                      "sleep",
                      2,
                      dataIndex,
                      itemData
                    )
                  }
                />
              </View>
            </AtTabsPane>
            <AtTabsPane current={tab} index={3}>
              <View className="tabPanelView">
                <TempertureList
                  compLoading={pageLoading}
                  tempData={_.get(currentData, "temperture", null)}
                  onItemClick={(dataIndex, itemData) =>
                    this.handleActionSheet(
                      true,
                      "temperture",
                      3,
                      dataIndex,
                      itemData
                    )
                  }
                />
              </View>
            </AtTabsPane>
            <AtTabsPane current={tab} index={4}>
              <View className="tabPanelView">
                <NoteTab
                  compLoading={pageLoading}
                  noteData={_.get(currentData, "note", "")}
                  goEdit={() => this.goInput("note", 4, 0)}
                  isEmptyContent={isEmptyString(_.get(currentData, "note", ""))}
                />
              </View>
            </AtTabsPane>
          </AtTabs>
        </View>

        <AtActionSheet
          isOpened={_.get(editActon, "visible", false)}
          cancelText="取消"
          onCancel={() => this.handleActionSheet(false, "", 0, 0, null)}
          onClose={() => this.handleActionSheet(false, "", 0, 0, null)}
        >
          <AtActionSheetItem onClick={() => this.handleItemEdit()}>
            编辑
          </AtActionSheetItem>
          <AtActionSheetItem onClick={() => this.handleItemDelete(dateIndex)}>
            <Text style="color:#E93B3D">删除</Text>
          </AtActionSheetItem>
        </AtActionSheet>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => {
  return {
    garyData: state.gary.garyData,
    selectDay: state.gary.selectDay,
    isUpdate: state.gary.isDataUpate,
    userData: state.gary.userData,
    glbCustom: state.gary.globalCustom
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
    },
    changeUserData: status => {
      dispatch(changeUserData(status));
    },
    changeGlbCustom: duration => {
      dispatch(changeGlobalCustom(duration));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
