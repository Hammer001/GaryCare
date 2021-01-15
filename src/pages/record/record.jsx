import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Picker, Text } from "@tarojs/components";
import { AtInput, AtButton, AtSegmentedControl, AtRadio } from "taro-ui";
import { getTimeNow, getToday } from "../../util/timeUtil";
import { changeDataUpdateStatus } from "../../actions/gary";
import { findDateIndex } from "../../util/findDateIndex";
import TitleComp from "../../component/TitleComp";
import VolumePicker from "../../component/VolumePicker";
import _ from "lodash";
import "./record.scss";

const feedType = [
  { label: "母乳", value: "母乳" },
  { label: "奶粉", value: "奶粉" }
];

class RecordPage extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      value: "",
      today: getToday(),
      segTab: 0,
      tempValue: "",
      radio: feedType[0].value,
      volumeValue: 0
    };
  }

  handleRadioChange(value) {
    this.setState({
      radio: value
    });
  }

  handleChange(value) {
    this.setState({
      value
    });
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return value;
  }

  handleTempChange(value) {
    this.setState({
      tempValue: value
    });
    return value;
  }

  segementChange(value) {
    this.setState({
      segTab: value
    });
  }

  onSubmit = now => {
    const { selectDay, garyData } = this.props;
    const { value, segTab, tempValue, radio, volumeValue } = this.state;
    let newData = garyData || [];
    let dateIndex = findDateIndex(newData, selectDay);
    let isDataHasThisDay = dateIndex !== -1 ? true : false;

    // 判断是否有对应时间，没有说明肯定是个新的日期，可以直接进行创建
    if (!isDataHasThisDay) {
      let temp = { date: selectDay, feed: [], temperture: [] };
      newData.push(temp);
      dateIndex = findDateIndex(newData, selectDay); // 初始化数据后更新index，否则会一直保存-1
    }

    if (segTab === 0) {
      const reg = /^(20|21|22|23|[0-1]\d):[0-5]\d$/;
      const regExp = new RegExp(reg);
      const newTime = now ? getTimeNow() : value;

      if (newTime === "") {
        this.handleShowToast("请输入时间", "none", 3000);
        return;
      } else if (!regExp.test(newTime)) {
        this.handleShowToast("时间格式错误！00:00", "none", 3000);
        return;
      } else {
        //第二种可能就是创建过数据，所以数据不可能为空，可以直接进行push数据
        if (_.isArray(_.get(newData[dateIndex], "feed", null))) {
          let newPushValue = {
            key: new Date().getTime(), // 毫秒级时间戳
            time: newTime,
            type: radio,
            volume: volumeValue
          };
          newData[dateIndex].feed.push(newPushValue);
          this.storeDataAndReturn(newData);
        }
      }
    } else {
      const regTemp = /^\d+(\.\d+)?$/;
      const regTempExp = new RegExp(regTemp);
      if (tempValue === "") {
        this.handleShowToast("请输入温度", "none", 3000);
        return;
      } else if (!regTempExp.test(tempValue)) {
        this.handleShowToast("请输入正确的温度", "none", 3000);
        return;
      } else {
        if (_.isArray(_.get(newData[dateIndex], "temperture", null))) {
          newData[dateIndex].temperture.push(tempValue);
          this.storeDataAndReturn(newData);
        }
      }
    }
    console.log("修改过的数据", newData);
  };

  storeDataAndReturn = data => {
    Taro.setStorage({
      key: "gary-care",
      data: data,
      success: res => {
        // console.log(res);
        this.props.changeUpdateStatus(true);
        this.handleShowToast("设置成功！", "success", 2000);
        Taro.switchTab({
          url: "/pages/index/index"
        });
      }
    });
  };

  handleShowToast = (text, icon, timer) => {
    Taro.showToast({
      title: text,
      icon: icon,
      duration: timer
    });
  };

  render() {
    const { segTab, value, tempValue, today } = this.state;
    return (
      <View className="recordView">
        <View className="segmentView">
          <View className="segementComp">
            <AtSegmentedControl
              values={["喂奶", "体温"]}
              onClick={this.segementChange.bind(this)}
              current={segTab}
            />
          </View>
        </View>
        {segTab === 0 ? (
          <>
            <TitleComp title="喂养时间" />
            <AtInput
              name="feed"
              type="text"
              placeholder="记录喂奶时间"
              value={value}
              onChange={this.handleChange.bind(this)}
            />
            <TitleComp title="喂奶量" />
            <VolumePicker
              keys="volume_record"
              title="选择喂奶量"
              afterSetSuccess={pickerValue =>
                this.setState({ volumeValue: pickerValue })
              }
              defaultValue={defaultValue =>
                this.setState({ volumeValue: defaultValue })
              }
            />
            <TitleComp title="喂养方式" />
            <AtRadio
              options={feedType}
              value={this.state.radio}
              onClick={this.handleRadioChange.bind(this)}
            />
          </>
        ) : (
          <>
            <TitleComp title="记录体温" />
            <AtInput
              name="temperture"
              type="number"
              placeholder="记录体温"
              value={tempValue}
              onChange={this.handleTempChange.bind(this)}
            >
              ℃
            </AtInput>
          </>
        )}

        <View className="confirmView">
          <AtButton type="primary" onClick={() => this.onSubmit()}>
            确定
          </AtButton>
          <View style="margin-bottom:30rpx" />
          {segTab === 0 && (
            <AtButton
              onClick={() => this.onSubmit("now")}
              disabled={today !== this.props.selectDay ? true : false}
            >
              现在喂
            </AtButton>
          )}
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

export default connect(mapStateToProps, mapDispatchToProps)(RecordPage);
