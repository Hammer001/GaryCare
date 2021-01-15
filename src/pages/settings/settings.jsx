import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Picker, Text } from "@tarojs/components";
import { AtList, AtListItem, AtAvatar, AtIcon } from "taro-ui";
import { changeDataUpdateStatus } from "../../actions/gary";
import { findDateIndex } from "../../util/findDateIndex";
import VolumePicker from "../../component/VolumePicker";
import _ from "lodash";
import "./settings.scss";

const levelObject = {
  high: <Text style="color:#ff4949">偏高</Text>,
  low: <Text style="color:#13ce66">偏低</Text>,
  normal: <Text style="color:#78a4fa">正常</Text>,
  abnormal: <Text style="color:#ffc82c">异常</Text>
};

class Settings extends Component {
  state = {
    currentData: null
  };

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

  render() {
    const { currentData } = this.state;
    return (
      <View className="settingView">
        <View className="topBackground"></View>
        <View className="at-row at-row__justify--center avatarView">
          <View className="at-col at-col-2" style="margin-top:-68rpx">
            <AtAvatar circle text="Gary" size="large"></AtAvatar>
          </View>
        </View>
        <View className="at-row at-row__justify--center userView">
          <View className="at-col at-col-5">
            <Text>USER</Text>
          </View>
        </View>
        <View className="at-row dataView">
          <View className="at-col at-col--wrap dataContent">
            <View className="dataCount">
              <AtIcon value="calendar" size="26" color="#6190e8"></AtIcon>
            </View>
            <View className="dataName">{this.props.selectDay}</View>
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
          <VolumePicker
            keys="duration"
            title="选择喂奶间隔"
            afterSetSuccess={status => this.props.changeUpdateStatus(status)}
          />
          <VolumePicker
            keys="volume"
            title="选择常用喂奶量"
            afterSetSuccess={status => {}}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectDay: state.gary.selectDay,
    garyData: state.gary.garyData
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeUpdateStatus: status => {
      dispatch(changeDataUpdateStatus(status));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
