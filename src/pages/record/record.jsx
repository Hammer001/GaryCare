import React, { Component } from "react";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { connect } from "react-redux";
import { View, Picker, Text } from "@tarojs/components";
import {
  AtInput,
  AtButton,
  AtRadio,
  AtGrid,
  AtTextarea,
  AtList,
  AtListItem,
  AtDivider
} from "taro-ui";
import { getTimeNow, getToday } from "../../util/timeUtil";
import { changeDataUpdateStatus, setGaryData } from "../../actions/gary";
import { findDateIndex } from "../../util/findDateIndex";
import TitleComp from "../../component/TitleComp";
import VolumePicker from "../../component/VolumePicker";
import PooTag from "./pooTag";
import ColorTag from "./colorTag";
import SleepTime from "./sleepTime";
import TagHeader from "../../component/TagHeader";
import { globalUrl } from "../../util/globalUrl";
import { showToast } from "../../util/toastUtil";
import { newRequest } from "../../util/requestUtil";
import moment from "moment";
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
const get_now = getTimeNow();
class RecordPage extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      value: {
        time: get_now,
        pootime: get_now,
        feedType: feedType[0].value,
        temperture: "",
        shape: "",
        color: "",
        volumeValue: 0,
        tempTime: get_now,
        start: ["", ""],
        end: ["", ""],
        note: "",
        feedTime: ""
      },
      today: getToday(),
      sleepTimeMode: "lastnight",
      segTab: 0,
      browse: [0], //TODO： 浏览历史，是否可以填写不同分页的数据最后一起提交
      buttonLoading: false,
      nowBtnLoading: false,
      editMode: { edit: false, key: null }
    };
    this.timer;
  }

  componentDidShow(options) {
    const { garyData, selectDay } = this.props;
    const routeData = getCurrentInstance();
    const routeType = _.get(routeData, "router.params.type", null); //从哪个tab跳转过来
    const timeTitle =
      selectDay === this.state.today ? selectDay + " " + "今天" : selectDay;
    console.log("getCurrentInstance", routeData);
    // note编辑模式，路由参数相同时跳转到笔记tab，并修改数据为上次的笔记内容
    if (routeType && _.size(routeType) > 1) {
      // routeType=1的时候是tab切换的数值，并不是用户要编辑
      const getIndexFromRoute = _.get(
        routeData,
        "router.params.tabIndex",
        null
      );
      const getIndexDataFromRoute = _.get(
        routeData,
        "router.params.dataIndex",
        null
      );
      const dayIndex = _.findIndex(garyData, o => o.date === selectDay);
      let newValue = this.state.value;

      if (routeType === "note") {
        newValue.note = dayIndex !== -1 ? garyData[dayIndex].note : "";
        this.setState({
          value: newValue,
          segTab: 4
        });
      } else {
        let newItem = _.get(
          garyData,
          `[${dayIndex}][${routeType}][${getIndexDataFromRoute}]`,
          null
        );
        if (newItem && _.isObject(newItem)) {
          //通过item中相同的key值快速赋值value的值，呈现出要编辑的内容
          Object.keys(newItem).map(n => {
            if (n === "start" || n === "end") {
              newValue[n] = _.split(newItem[n], "/");
            } else {
              newValue[n] = newItem[n];
            }
          });
          //   console.log("newItem", newItem);
          //   console.log("newValue", newValue);
          this.setState({
            value: newValue,
            segTab: Number(getIndexFromRoute),
            editMode: { edit: true, key: newItem.key }
          });
        }
      }
    } else {
      // 只是点击添加按钮，则首页在哪个tab上停留，进入时就显示哪个tab的内容
      let getIndexTabNumber = routeType ? Number(routeType) : 0;
      this.setState({
        segTab: getIndexTabNumber
      });
    }

    Taro.setNavigationBarTitle({
      title: timeTitle
    });
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  componentDidHide() {
    this.timer && clearTimeout(this.timer);
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
    const { editMode } = this.state;
    // let newBroser = this.state.browse;
    // newBroser.push(value);
    if (editMode.edit) {
      //编辑模式下不可切换tab
      showToast("编辑数据时不可以切换哟！", "none", 3000);
    } else {
      this.setState({
        segTab: value
        //   browse: newBroser
      });
    }
  }

  onSubmit = async now => {
    /**
     * 根据tab，实现不同条件的提交条件
     * 数据没有错误之后，找到对应的key值
     * 每个key值里面是数组，每个对象里面存储对应的数据，通过index更新整个数据
     * 最后提交，返回index页面
     */
    const response = await Taro.request({
      url: globalUrl + "/get/user/data",
      method: "POST",
      data: {
        _id: _.get(this.props, "userData._id")
      },
      header: {
        "content-type": "application/json"
      }
    });
    // console.log("submit", res);
    // 先从服务器获取最新数据，避免两个用户的时候数据冲突
    const { selectDay, garyData } = this.props;
    const { value, segTab, editMode } = this.state;
    let newData = _.get(response, "data.callback.data", []) || [];
    let dateIndex = findDateIndex(newData, selectDay);
    let isDataHasThisDay = dateIndex !== -1 ? true : false;
    const isEditMode = _.get(editMode, "edit");
    const editKey = _.get(editMode, "key");
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
    const feedTimeTemp = /^\d+(\.\d+)?$/;
    const timeExp = new RegExp(timeReg);
    const feedTimeExp = new RegExp(feedTimeTemp);
    switch (segTab) {
      case 0: // 喂奶
        const newTime = now ? getTimeNow() : value["time"];
        /**
 * else if (!timeExp.test(newTime)) {
          showToast("时间格式错误！00:00", "none", 3000);
          return;
        }
 */
        if (newTime === "") {
          showToast("请选择时间", "none", 3000);
          return;
        } else if (
          value["feedTime"] !== "" &&
          !feedTimeExp.test(value["feedTime"])
        ) {
          showToast("亲喂时间格式错误！", "none", 3000);
        } else {
          //第二种可能就是创建过数据，所以数据不可能为空，可以直接进行push数据
          let typeData = _.get(newData[dateIndex], "feed", null);

          if (_.isArray(typeData)) {
            let newPushValue = {
              key: new Date().getTime(), // 毫秒级时间戳
              time: newTime,
              type: value["feedType"],
              volume: value["volumeValue"]
            };
            if (isEditMode) {
              // 编辑模式下，只修改数据，不再push新数据
              let keyIndex = _.findIndex(typeData, o => o.key === editKey); //根据key值找到数据
              if (editKey) newPushValue.key = editKey;
              if (keyIndex !== -1)
                newData[dateIndex].feed[keyIndex] = newPushValue;
            } else {
              newData[dateIndex].feed.push(newPushValue);
            }
            this.handleStoreData(newData, now);
          }
        }
        break;
      case 1: // 排便
        const pootimeValue = value["pootime"];
        if (pootimeValue === "") {
          showToast("请选择时间", "none", 3000);
          return;
        } else {
          let typeData = _.get(newData[dateIndex], "poo", null);
          if (_.isArray(typeData)) {
            let newPushValue = {
              key: new Date().getTime(),
              pootime: pootimeValue,
              shape: value["shape"],
              color: value["color"],
              poo: true //统计页面用，合并数组后判断是否显示
            };
            if (isEditMode) {
              let keyIndex = _.findIndex(typeData, o => o.key === editKey);
              if (editKey) newPushValue.key = editKey;
              if (keyIndex !== -1)
                newData[dateIndex].poo[keyIndex] = newPushValue;
            } else {
              newData[dateIndex].poo.push(newPushValue);
            }
            this.handleStoreData(newData, now);
          }
        }
        break;
      case 2: // 睡眠
        const startTimeValue = value["start"][1];
        const endTimeValue = value["end"][1];
        const diffStartAndEnd = moment(_.join(value["end"], " ")).diff(
          moment(_.join(value["start"], " ")),
          "minute"
        );
        if (startTimeValue === "" || endTimeValue === "") {
          showToast("请选择时间", "none", 3000);
          return;
        } else if (diffStartAndEnd < 0) {
          showToast("醒来时间不能在睡眠时间之前", "none", 3000);
          return;
        } else {
          let typeData = _.get(newData[dateIndex], "sleep", null);
          if (_.isArray(typeData)) {
            let newPushValue = {
              key: new Date().getTime(),
              start: _.join(value["start"], "/"),
              end: _.join(value["end"], "/")
            };
            if (isEditMode) {
              let keyIndex = _.findIndex(typeData, o => o.key === editKey);
              if (editKey) newPushValue.key = editKey;
              if (keyIndex !== -1)
                newData[dateIndex].sleep[keyIndex] = newPushValue;
            } else {
              newData[dateIndex].sleep.push(newPushValue);
            }
            this.handleStoreData(newData, now);
          }
        }
        break;
      case 3: // 体温
        const regTemp = /^\d+(\.\d+)?$/;
        const regTempExp = new RegExp(regTemp);
        const tempTimeValue = value["tempTime"];
        let tempValue = value["temperture"];
        if (tempTimeValue === "") {
          showToast("请输入时间", "none", 3000);
          return;
        } else if (tempValue === "") {
          showToast("请输入温度", "none", 3000);
          return;
        } else if (!regTempExp.test(tempValue)) {
          showToast("请输入正确的温度", "none", 3000);
          return;
        } else {
          let typeData = _.get(newData[dateIndex], "temperture", null);
          if (_.isArray(typeData)) {
            let newPushValue = {
              key: new Date().getTime(),
              tempTime: tempTimeValue,
              temperture: tempValue
            };
            if (isEditMode) {
              let keyIndex = _.findIndex(typeData, o => o.key === editKey);
              if (editKey) newPushValue.key = editKey;
              if (keyIndex !== -1)
                newData[dateIndex].temperture[keyIndex] = newPushValue;
            } else {
              newData[dateIndex].temperture.push(newPushValue);
            }
            this.handleStoreData(newData, now);
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
          showToast("请输入内容", "none", 3000);
          return;
        } else {
          newData[dateIndex].note = noteValue;
          this.handleStoreData(newData, now);
        }
        break;
      default:
        break;
    }

    console.log("修改过的数据", newData);
  };

  handleStoreData = (data, now) => {
    if (now) {
      this.setState({ nowBtnLoading: true });
    } else {
      this.setState({ buttonLoading: true });
    }
    // console.log("newData", data);

    this.timer = setTimeout(() => {
      if (_.get(this.props, "userData._id", null)) {
        let params = {
          _id: this.props.userData._id,
          data: data
        };
        newRequest("/update/user/data", params).then(value => {
          let isError = _.get(value, "error");
          if (!isError) {
            this.props.updateGaryData(data);
            this.props.changeUpdateStatus({ data: true });
            showToast("记录成功！", "success", 2000);

            this.setState({
              nowBtnLoading: false,
              buttonLoading: false
            });

            Taro.switchTab({
              url: "/pages/index/index"
            });
          }
        });
      }
    }, 500);
  };

  renderRecordType = isCurrentDay => {
    /**
     * 根据tab渲染不同的输入模块
     * 每个模块输出都由value控制，输出set value[key值]，每个模块的value获取value的key值
     */
    const { segTab, value, tempValue, editMode, sleepTimeMode } = this.state;
    const { selectDay, glbCustom } = this.props;
    const thisRecordName = recordType[segTab].value;

    switch (segTab) {
      case 0:
        return (
          <>
            <TitleComp title={thisRecordName + "时间"} />
            {/* <AtInput
              name={recordType[segTab].key}
              type="text"
              placeholder={"记录" + thisRecordName + "时间"}
              value={value["time"]}
              onChange={value => this.handleChange("time", value)}
            /> */}

            <Picker
              mode="time"
              value={value["time"]}
              onChange={e => this.handleChange("time", e.detail.value)}
            >
              <AtList>
                <AtListItem title="请选择时间" extraText={value["time"]} />
              </AtList>
            </Picker>

            {value["feedType"] !== "food" && ( // 辅食的时候不显示
              <>
                <TitleComp title="喂奶量" />
                <VolumePicker
                  keys="volume_record"
                  title="选择喂奶量"
                  glbCustom={glbCustom}
                  afterSetSuccess={pickerValue =>
                    this.handleChange("volumeValue", pickerValue)
                  }
                  defaultValue={defaultValue =>
                    this.handleChange("volumeValue", defaultValue)
                  }
                />
              </>
            )}

            {/* {value["feedType"] === "breast" && ( // 母乳喂养时显示输入时间
              <>
                <TitleComp title="亲喂时间" />
                <AtInput
                  name="feedTime"
                  type="number"
                  placeholder=""
                  value={value["feedTime"]}
                  onChange={value => this.handleChange("feedTime", value)}
                >
                  分钟
                </AtInput>
              </>
            )} */}

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
            {/* <AtInput
              name={recordType[segTab].key}
              type="text"
              placeholder={"记录" + thisRecordName + "时间"}
              value={value["pootime"]}
              onChange={value => this.handleChange("pootime", value)}
            >
              {isCurrentDay && (
                <View
                  onClick={() => this.handleChange("pootime", getTimeNow())}
                >
                  现在
                </View>
              )}
            </AtInput> */}

            <Picker
              mode="time"
              value={value["pootime"]}
              onChange={e => this.handleChange("pootime", e.detail.value)}
            >
              <AtList>
                <AtListItem title="请选择时间" extraText={value["pootime"]} />
              </AtList>
            </Picker>

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
            {!_.get(editMode, "edit") && (
              <TagHeader
                size="small"
                type="primary"
                page="record"
                tagChange={value => this.setState({ sleepTimeMode: value })}
                tagData={[
                  {
                    key: 0,
                    keyName: "lastnight",
                    text: "昨晚睡眠",
                    active: true
                  },
                  { key: 1, keyName: "today", text: "今日睡眠", active: false }
                ]}
              />
            )}

            <SleepTime
              name="sleepStart"
              title="选择入睡时间"
              time={value["start"]}
              currentDay={selectDay}
              timeMode={sleepTimeMode}
              isEdit={_.get(editMode, "edit")}
              onValue={value => this.handleChange("start", value)}
            />
            <AtDivider content="to" fontColor="#9e9e9e" />
            <SleepTime
              name="sleepEnd"
              title="选择醒来时间"
              time={value["end"]}
              currentDay={selectDay}
              timeMode={null} //醒来时间可以不用根据标签变化
              isEdit={_.get(editMode, "edit")}
              onValue={value => this.handleChange("end", value)}
            />
          </>
        );
        break;
      case 3:
        return (
          <>
            <TitleComp title={"测量" + thisRecordName + "时间"} />
            {/* <AtInput
              name={recordType[segTab].key + "Time"}
              type="text"
              placeholder={"记录" + thisRecordName + "时间"}
              value={value["tempTime"]}
              onChange={value => this.handleChange("tempTime", value)}
            >
              {isCurrentDay && (
                <View
                  onClick={() => this.handleChange("tempTime", getTimeNow())}
                >
                  现在
                </View>
              )}
            </AtInput> */}

            <Picker
              mode="time"
              value={value["tempTime"]}
              onChange={e => this.handleChange("tempTime", e.detail.value)}
            >
              <AtList>
                <AtListItem title="请选择时间" extraText={value["tempTime"]} />
              </AtList>
            </Picker>

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
    const {
      segTab,
      today,
      buttonLoading,
      nowBtnLoading,
      editMode
    } = this.state;
    const isCurrentDay = today === this.props.selectDay ? true : false;
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

        {this.renderRecordType(isCurrentDay)}

        <View className="confirmView">
          <AtButton
            type="primary"
            onClick={() => this.onSubmit()}
            loading={buttonLoading}
            disabled={nowBtnLoading}
          >
            {_.get(editMode, "edit") ? "确认编辑" : "确定"}
          </AtButton>
          <View style="margin-bottom:30rpx" />
          {segTab === 0 && !_.get(editMode, "edit") && (
            <AtButton
              onClick={() => this.onSubmit("now")}
              loading={nowBtnLoading}
              disabled={!isCurrentDay}
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
    garyData: state.gary.garyData,
    userData: state.gary.userData,
    glbCustom: state.gary.globalCustom
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeUpdateStatus: status => {
      dispatch(changeDataUpdateStatus(status));
    },
    updateGaryData: data => {
      dispatch(setGaryData(data));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RecordPage);
