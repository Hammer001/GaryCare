import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Button, Text } from "@tarojs/components";
import {
  AtList,
  AtListItem,
  AtAvatar,
  AtIcon,
  AtModal,
  AtModalContent,
  AtModalAction
} from "taro-ui";
import { getToday } from "../../util/timeUtil";
import {
  setGaryData,
  setSelectDay,
  changeDataUpdateStatus,
  changeUserData
} from "../../actions/gary";
import { findDateIndex } from "../../util/findDateIndex";
import VolumePicker from "../../component/VolumePicker";
import { globalUrl } from "../../util/globalUrl";
import TitleComp from "../../component/TitleComp";
import _ from "lodash";
import "./settings.scss";

const levelObject = {
  high: <Text style="color:#ff4949">偏高</Text>,
  low: <Text style="color:#13ce66">偏低</Text>,
  normal: <Text style="color:#78a4fa">正常</Text>,
  abnormal: <Text style="color:#ffc82c">异常</Text>
};

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = { currentData: null, visible: false, shareAction: false };
    this.today = getToday();
  }

  onShareAppMessage(res) {
    return {
      title: "GaryCare小程序",
      path: "/pages/login/login",
      // imageUrl: "/images/aikepler-logo.jpeg",
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
    const { garyData, selectDay } = this.props;
    const dataIndex = findDateIndex(garyData, selectDay);

    if (dataIndex !== -1) {
      this.setState({
        currentData: garyData[dataIndex]
      });
    }
  }
  renderTemperture = data => {
    let tempArray = _.get(data, "temperture", null)
      ? _.get(data, "temperture", null).map(n => parseFloat(n))
      : null;
    if (tempArray && _.size(tempArray) > 0) {
      let isAbnormal = tempArray.some(t => {
        return t > 39 || t < 34;
      });

      let tempMean = _.mean(tempArray);

      if (isAbnormal) {
        return levelObject["abnormal"];
      } else if (tempMean > 37) {
        return levelObject["high"];
      } else if (tempMean < 36) {
        return levelObject["low"];
      } else {
        return levelObject["normal"];
      }
    } else {
      return "无记录";
    }
  };

  handleLogout = () => {
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

  handleClose = () => {
    this.setState({ visible: false });
  };

  render() {
    const { currentData } = this.state;
    const timeTitle = this.props.selectDay === this.today ? "  今天" : "";
    const userPhone = _.get(this.props, "userData.phone", "");
    return (
      <View className="settingView">
        <View className="topBackground">
          <View className="at-row avatarView">
            <View className="at-col at-col-3">
              <AtAvatar
                className="avatarComp"
                circle
                text="Gary"
                size="large"
                style="margin:0 auto"
              ></AtAvatar>
            </View>
            <View className="at-col at-col-4 textView">{userPhone}</View>
          </View>
        </View>

        <View className="at-row at-row__justify--center userView">
          <View className="at-col at-col-5">
            <Text>{this.props.selectDay + timeTitle}</Text>
            <View className="dateBorder"></View>
          </View>
        </View>

        <View className="at-row dataView">
          <View className="at-col at-col--wrap dataContent">
            <View className="dataCount">
              {_.get(currentData, "poo", null) && _.size(currentData["poo"]) > 0
                ? _.size(currentData["poo"])
                : "无记录"}
            </View>
            <View className="dataName">排便次数</View>
          </View>
          <View className="at-col dataContent">
            <View className="dataCount">
              {_.get(currentData, "feed", null) &&
              _.size(currentData["feed"]) > 0
                ? _.size(currentData["feed"])
                : "无记录"}
            </View>
            <View className="dataName">喂养次数</View>
          </View>
          <View className="at-col">
            <View className="dataCount">
              {this.renderTemperture(currentData)}
            </View>
            <View className="dataName">体温</View>
          </View>
        </View>

        <View className="contentView">
          <View className="dividerView">
            <VolumePicker
              keys="duration"
              title="选择喂奶间隔"
              afterSetSuccess={status =>{}
                //this.props.changeUpdateStatus({ login: false, data: true })
              }
            />
            <VolumePicker
              keys="volume"
              title="选择常用喂奶量"
              afterSetSuccess={status => {}}
            />
          </View>

          <View className="dividerView">
            <AtList>
              <AtListItem
                title="关于GaryCare"
                arrow="right"
                thumb={globalUrl + "/about-us.png"}
                onClick={() => Taro.navigateTo({ url: "/pages/aboutus/about" })}
              />
              <AtListItem
                title="分享给他人"
                arrow="right"
                thumb={globalUrl + "/share.png"}
                onClick={() => this.setState({ shareAction: true })}
              />
              <AtListItem
                title="退出登录"
                arrow="right"
                thumb={globalUrl + "/log-out.png"}
                onClick={() => this.setState({ visible: true })}
              />
            </AtList>
          </View>
        </View>

        <AtModal
          isOpened={this.state.visible}
          cancelText="取消"
          confirmText="确认"
          onClose={this.handleClose}
          onCancel={this.handleClose}
          onConfirm={this.handleLogout}
          content="是否退出登录？"
        />

        <AtModal
          isOpened={this.state.shareAction}
          title={null}
          onClose={() => this.setState({ shareAction: false })}
        >
          <AtModalContent>好的工具期待被分享哟！</AtModalContent>
          <AtModalAction>
            <Button onClick={() => this.setState({ shareAction: false })}>
              返回
            </Button>
            <Button onClick={this.onShareTimeline} openType="share">
              立刻分享
            </Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectDay: state.gary.selectDay,
    garyData: state.gary.garyData,
    userData: state.gary.userData
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeUpdateStatus: status => {
      dispatch(changeDataUpdateStatus(status));
    },
    updateGaryData: data => {
      dispatch(setGaryData(data));
    },
    changeUserData: status => {
      dispatch(changeUserData(status));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
