import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Text } from "@tarojs/components";
import { AtButton, AtTextarea } from "taro-ui";
import { getTimeNow, getToday } from "../../util/timeUtil";
import { changeDataUpdateStatus } from "../../actions/gary";
import { findDateIndex } from "../../util/findDateIndex";
import { showToast } from "../../util/toastUtil";
import TitleComp from "../../component/TitleComp";
import _ from "lodash";
import "./note.scss";

class NotePage extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      value: "",
      today: getToday()
    };
  }

  componentDidShow(options) {
    const { selectDay, garyData } = this.props;
    let index = findDateIndex(garyData, selectDay);
    if (index !== -1) {
      this.setState({
        value: garyData[index].note || ""
      });
    }
  }

  handleChange(value) {
    this.setState({
      value
    });
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return value;
  }

  onSubmit = now => {
    const { selectDay, garyData } = this.props;
    const { value } = this.state;
    let newData = garyData || [];
    let dateIndex = findDateIndex(newData, selectDay);
    let isDataHasThisDay = dateIndex !== -1 ? true : false;

    if (!isDataHasThisDay) {
      let temp = { date: selectDay, feed: [], temperture: [], note: "" };
      newData.push(temp);
      dateIndex = findDateIndex(newData, selectDay);
    }

    if (value == "undefined" || !value || !/[^\s]/.test(value)) {
      showToast("请输入内容", "none", 3000);
      return;
    } else {
      newData[dateIndex].note = value;
      this.storeDataAndReturn(newData);
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
        showToast("保存成功！", "success", 2000);
        Taro.switchTab({
          url: "/pages/index/index"
        });
      }
    });
  };

  render() {
    const { value, today } = this.state;
    return (
      <View className="noteView">
        <TitleComp title={this.props.selectDay} />

        <View className="textareaView">
          <AtTextarea
            value={value}
            onChange={this.handleChange.bind(this)}
            maxLength={400}
            placeholder="笔记内容"
            height={250}
          />
        </View>

        <View className="confirmView">
          <AtButton type="primary" onClick={() => this.onSubmit()}>
            保存
          </AtButton>
          <View style="margin-bottom:30rpx" />
          <AtButton onClick={() => this.setState({ value: "" })}>清空</AtButton>
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

export default connect(mapStateToProps, mapDispatchToProps)(NotePage);
