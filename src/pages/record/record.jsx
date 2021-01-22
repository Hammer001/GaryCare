import React, { Component } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Picker, Text } from "@tarojs/components";
import { AtInput, AtButton, AtRadio, AtGrid, AtTextarea } from "taro-ui";
import { getTimeNow, getToday } from "../../util/timeUtil";
import { changeDataUpdateStatus } from "../../actions/gary";
import { findDateIndex } from "../../util/findDateIndex";
import TitleComp from "../../component/TitleComp";
import VolumePicker from "../../component/VolumePicker";
import PooTag from "./pooTag";
import ColorTag from "./colorTag";
import SleepTime from "./sleepTime";
import { globalUrl } from "../../util/globalUrl";
import _ from "lodash";
import "./record.scss";

const feedType = [
  { label: "母乳", value: "breast" },
  { label: "奶粉", value: "powder" },
  { label: "辅食", value: "food" }
];
const recordType = [
  {
    image: globalUrl + "/bottle.png",
    value: "喂奶",
    key: "feed"
  },
  {
    image: globalUrl + "/poo_1.png",
    value: "排便",
    key: "poo"
  },
  {
    image: globalUrl + "/sleep_1.png",
    value: "睡眠",
    key: "sleep"
  },
  {
    image: globalUrl + "/temperture_1.png",
    value: "体温",
    key: "temperture"
  },
  {
    image: globalUrl + "/note.png",
    value: "笔记",
    key: "note"
  }
];

class RecordPage extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      value: {
        time: "",
        pootime: "",
        feedType: feedType[0].value,
        temperture: "",
        shape: "",
        color: "",
        volumeValue: 0,
        tempTime: "",
        start: ["", ""],
        end: ["", ""],
        note: ""
      },
      today: getToday(),
      segTab: 0,
      browse: [0] //TODO： 浏览历史，是否可以填写不同分页的数据最后一起提交
    };
  }

  componentDidShow(options) {
    const { garyData, selectDay } = this.props;
    const noteType = _.get(getCurrentInstance(), "router.params.type", null);
    // console.log("getCurrentInstance", noteType);
    // note编辑模式，路由参数相同时跳转到笔记tab，并修改数据为上次的笔记内容
    if (noteType === "editnote") {
      let dayIndex = _.findIndex(garyData, o => o.date === selectDay);
      let newValue = this.state.value;
      newValue.note = dayIndex !== -1 ? garyData[dayIndex].note : "";
      this.setState({
        value: newValue,
        segTab: 4
      });
    } else {
      let getIndexTabNumber = noteType ? Number(noteType) : 0;
      this.setState({
        segTab: getIndexTabNumber
      });
    }
  }

  handleChange(type, value) {
    let newValue = this.state.value;
    newValue[type] = value;
    this.setState({
      value: newValue
    });
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return value;
  }

  segementChange(value) {
    // let newBroser = this.state.browse;
    // newBroser.push(value);
    this.setState({
      segTab: value
      //   browse: newBroser
    });
  }

  onSubmit = now => {
    /**
     * 根据tab，实现不同条件的提交条件
     * 数据没有错误之后，找到对应的key值
     * 每个key值里面是数组，每个对象里面存储对应的数据，通过index更新整个数据
     * 最后提交，返回index页面
     */
    const { selectDay, garyData } = this.props;
    const { value, segTab } = this.state;
    let newData = garyData || [];
    let dateIndex = findDateIndex(newData, selectDay);
    let isDataHasThisDay = dateIndex !== -1 ? true : false;

    // 判断是否有对应时间，没有说明肯定是个新的日期，可以直接进行创建
    if (!isDataHasThisDay) {
      let temp = {
        date: selectDay,
        feed: [],
        temperture: [],
        poo: [],
        sleep: [],
        note: ""
      };
      newData.push(temp);
      dateIndex = findDateIndex(newData, selectDay); // 初始化数据后更新index，否则会一直保存-1
    }

    const timeReg = /^(20|21|22|23|[0-1]\d):[0-5]\d$/;
    const timeExp = new RegExp(timeReg);
    switch (segTab) {
      case 0: // 喂奶
        const newTime = now ? getTimeNow() : value["time"];

        if (newTime === "") {
          this.handleShowToast("请输入时间", "none", 3000);
          return;
        } else if (!timeExp.test(newTime)) {
          this.handleShowToast("时间格式错误！00:00", "none", 3000);
          return;
        } else {
          //第二种可能就是创建过数据，所以数据不可能为空，可以直接进行push数据
          if (_.isArray(_.get(newData[dateIndex], "feed", null))) {
            let newPushValue = {
              key: new Date().getTime(), // 毫秒级时间戳
              time: newTime,
              type: value["feedType"],
              volume: value["volumeValue"]
            };
            newData[dateIndex].feed.push(newPushValue);
            this.storeDataAndReturn(newData);
          }
        }
        break;
      case 1: // 排便
        const pootimeValue = value["pootime"];
        if (pootimeValue === "") {
          this.handleShowToast("请输入时间", "none", 3000);
          return;
        } else if (!timeExp.test(pootimeValue)) {
          this.handleShowToast("时间格式错误！00:00", "none", 3000);
          return;
        } else {
          //第二种可能就是创建过数据，所以数据不可能为空，可以直接进行push数据
          if (_.isArray(_.get(newData[dateIndex], "poo", null))) {
            let newPushValue = {
              key: new Date().getTime(),
              time: pootimeValue,
              shape: value["shape"],
              color: value["color"],
              poo: true //统计页面用，合并数组后判断是否显示
            };
            newData[dateIndex].poo.push(newPushValue);
            this.storeDataAndReturn(newData);
          }
        }
        break;
      case 2: // 睡眠
        const startTimeValue = value["start"][1];
        const endTimeValue = value["end"][1];
        if (startTimeValue === "" || endTimeValue === "") {
          this.handleShowToast("请输入时间", "none", 3000);
          return;
        } else if (
          !timeExp.test(startTimeValue) ||
          !timeExp.test(endTimeValue)
        ) {
          this.handleShowToast("时间格式错误！00:00", "none", 3000);
          return;
        } else {
          //第二种可能就是创建过数据，所以数据不可能为空，可以直接进行push数据
          if (_.isArray(_.get(newData[dateIndex], "sleep", null))) {
            let newPushValue = {
              key: new Date().getTime(),
              start: _.join(value["start"], "/"),
              end: _.join(value["end"], "/")
            };
            newData[dateIndex].sleep.push(newPushValue);
            this.storeDataAndReturn(newData);
          }
        }
        break;
      case 3: // 体温
        const regTemp = /^\d+(\.\d+)?$/;
        const regTempExp = new RegExp(regTemp);
        const tempTimeValue = value["tempTime"];
        let tempValue = value["temperture"];
        if (tempTimeValue === "") {
          this.handleShowToast("请输入时间", "none", 3000);
          return;
        } else if (!timeExp.test(tempTimeValue)) {
          this.handleShowToast("时间格式错误！00:00", "none", 3000);
          return;
        } else if (tempValue === "") {
          this.handleShowToast("请输入温度", "none", 3000);
          return;
        } else if (!regTempExp.test(tempValue)) {
          this.handleShowToast("请输入正确的温度", "none", 3000);
          return;
        } else {
          if (_.isArray(_.get(newData[dateIndex], "temperture", null))) {
            let newPushValue = {
              key: new Date().getTime(),
              time: tempTimeValue,
              tempValue: tempValue
            };
            newData[dateIndex].temperture.push(newPushValue);
            this.storeDataAndReturn(newData);
          }
        }
        break;
      case 4: // 笔记
        const noteValue = value["note"];
        if (
          noteValue == "undefined" ||
          !noteValue ||
          !/[^\s]/.test(noteValue)
        ) {
          this.handleShowToast("请输入内容", "none", 3000);
          return;
        } else {
          newData[dateIndex].note = noteValue;
          this.storeDataAndReturn(newData);
        }
        break;
      default:
        break;
    }

    console.log("修改过的数据", newData);
  };

  storeDataAndReturn = data => {
    Taro.setStorage({
      key: "gary-care",
      data: data,
      success: res => {
        // console.log(res);
        this.props.changeUpdateStatus({ login: false, data: true });
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

  renderRecordType = () => {
    /**
     * 根据tab渲染不同的输入模块
     * 每个模块输出都由value控制，输出set value[key值]，每个模块的value获取value的key值
     */
    const { segTab, value, tempValue, today } = this.state;
    const { selectDay } = this.props;
    const thisRecordName = recordType[segTab].value;

    switch (segTab) {
      case 0:
        return (
          <>
            <TitleComp title={thisRecordName + "时间"} />
            <AtInput
              name={recordType[segTab].key}
              type="text"
              placeholder={"记录" + thisRecordName + "时间"}
              value={value["time"]}
              onChange={value => this.handleChange("time", value)}
            />

            {value["feedType"] !== "food" && ( // 辅食的时候不显示
              <>
                <TitleComp title="喂奶量" />
                <VolumePicker
                  keys="volume_record"
                  title="选择喂奶量"
                  afterSetSuccess={pickerValue =>
                    this.handleChange("volumeValue", pickerValue)
                  }
                  defaultValue={defaultValue =>
                    this.handleChange("volumeValue", defaultValue)
                  }
                />
              </>
            )}

            <TitleComp title="喂养方式" />
            <AtRadio
              options={feedType}
              value={value["feedType"]}
              onClick={value => this.handleChange("feedType", value)}
            />
          </>
        );
        break;
      case 1:
        return (
          <>
            <TitleComp title={thisRecordName + "时间"} />
            <AtInput
              name={recordType[segTab].key}
              type="text"
              placeholder={"记录" + thisRecordName + "时间"}
              value={value["pootime"]}
              onChange={value => this.handleChange("pootime", value)}
            >
              <View onClick={() => this.handleChange("pootime", getTimeNow())}>
                现在
              </View>
            </AtInput>

            <TitleComp title="性状" />
            <PooTag onSelect={value => this.handleChange("shape", value)} />

            <TitleComp title="颜色" />
            <ColorTag onSelect={value => this.handleChange("color", value)} />
          </>
        );
        break;
      case 2:
        return (
          <>
            <TitleComp title="睡眠记录" />
            <SleepTime
              name="sleepStart"
              title="入睡时间"
              time={value["start"][1]}
              currentDay={selectDay}
              onValue={value => this.handleChange("start", value)}
            />
            <SleepTime
              name="sleepEnd"
              title="醒来时间"
              time={value["end"][1]}
              currentDay={selectDay}
              onValue={value => this.handleChange("end", value)}
            />
          </>
        );
        break;
      case 3:
        return (
          <>
            <TitleComp title={"测量" + thisRecordName + "时间"} />
            <AtInput
              name={recordType[segTab].key + "Time"}
              type="text"
              placeholder={"记录" + thisRecordName + "时间"}
              value={value["tempTime"]}
              onChange={value => this.handleChange("tempTime", value)}
            >
              <View onClick={() => this.handleChange("tempTime", getTimeNow())}>
                现在
              </View>
            </AtInput>
            <TitleComp title="记录体温" />
            <AtInput
              name="temperture"
              type="number"
              placeholder="记录体温"
              value={value["temperture"]}
              onChange={value => this.handleChange("temperture", value)}
            >
              ℃
            </AtInput>
          </>
        );
        break;
      case 4:
        return (
          <>
            <TitleComp title="笔记" />
            <AtTextarea
              value={value["note"]}
              onChange={value => this.handleChange("note", value)}
              maxLength={400}
              placeholder="笔记内容"
              height={250}
            />
          </>
        );
        break;
      default:
        break;
    }
  };

  render() {
    const { segTab, today } = this.state;

    return (
      <View className="recordView">
        <View className="segmentView">
          <View className="segementComp">
            <AtGrid
              columnNum={5}
              hasBorder={false}
              data={recordType}
              onClick={(item, index) => this.segementChange(index)}
            />
          </View>
        </View>

        {this.renderRecordType()}

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
          {segTab === 4 && (
            <AtButton
              onClick={() => {
                let newValue = this.state.value;
                newValue.note = "";
                this.setState({
                  value: newValue
                });
              }}
            >
              清空
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
