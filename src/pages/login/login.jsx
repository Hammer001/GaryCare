import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import { AtForm, AtInput, AtButton } from "taro-ui";
import { connect } from "react-redux";
import { globalUrl } from "../../util/globalUrl";
import {
  changeDataUpdateStatus,
  changeUserData,
  setGaryData
} from "../../actions/gary";
import { newRequest } from "../../util/requestUtil";
import { showToast } from "../../util/toastUtil";
import _ from "lodash";
import "./login.scss";

class Login extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      userInfo: null,
      type: "login",
      value: "",
      password: "",
      confirm: ""
    };
  }
  componentDidShow(options) {
    Taro.getStorage({
      key: "user",
      success: res => {
        const userData = _.get(res, "data", null);
        if (userData && userData._id) {
          //   this.setState({
          //     userInfo: userData
          //   });
          this.jumpToIndex();
          this.props.changeUpdateStatus({ data: true });
          this.props.changeUserData(userData);
          this.props.updateGaryData(_.get(userData, "data", []));
        }
      }
    });
  }
  handleChange(value) {
    this.setState({
      value
    });
  }
  handlePasswordChange(value) {
    this.setState({
      password: value
    });
  }
  handlePasswordConfirm(value) {
    this.setState({
      confirm: value
    });
  }
  onSubmit() {
    /**
     * 登录逻辑：
     * 服务器signin/signup接口，注册需要手机号和密码，登录则需要数据的_id，所以需要用手机号去查找到id。
     * 找到后进行判断，符合条件进行登录或是注册。
     */
    const { value, password, type, confirm } = this.state;
    const phoneReg = /^1[3456789]\d{9}$/;
    const regPhoneExp = new RegExp(phoneReg);
    if (password === "") {
      showToast("请输入密码", "none", 3000);
      return;
    } else if (!regPhoneExp.test(value)) {
      showToast("请输入正确的手机号", "none", 3000);
      return;
    } else if (type === "register" && password !== confirm) {
      showToast("两次输入的密码不相同", "none", 3000);
    } else {
      let params = {
        phone: value
      };

      newRequest("/findPhone", params).then(data => {
        console.log("getPhone返回", data);
        const getPhoneData = data;
        if (getPhoneData) {
          let newData = {
            phone: value,
            pass: password
          };
          if (!getPhoneData.usable && type === "login") {
            newData._id = getPhoneData._id;
            this.handleLoginAndRegister("/signin", newData);
          } else if (getPhoneData.usable && type === "register") {
            this.handleLoginAndRegister("/signup", newData);
          } else if (getPhoneData.usable && type === "login") {
            showToast("账户还未注册", "none", 3000);
          } else if (!getPhoneData.usable && type === "register") {
            showToast("账户已注册", "none", 3000);
          }
        }
      });
    }
  }

  handleLoginAndRegister = (url, postData) => {
    newRequest(url, postData).then(data => {
      console.log("登录返回", data);
      if (_.get(data, "error", null)) {
        showToast(_.get(data, "msg"), "none", 3000);
      } else {
        this.storeUserData(data);
      }
    });
  };
  storeUserData = response => {
    const setUserData = response;
    if (setUserData) {
      Taro.setStorage({
        key: "user",
        data: setUserData,
        success: res => {
          console.log("存储user成功", setUserData);
          this.props.changeUserData(setUserData);
        },
        fail: res => {
          showToast("存储失败！", "error", 3000);
          return;
        }
      });

      Taro.setStorage({
        key: "gary-care",
        data: _.get(setUserData, "data", []),
        fail: res => {
          showToast("存储失败！", "error", 3000);
        }
      });

      this.props.updateGaryData(_.get(setUserData, "data", []));
      //this.props.changeUpdateStatus({ login: true, data: true });
      this.jumpToIndex();
    }
  };
  jumpToIndex = () => {
    Taro.switchTab({ url: "/pages/index/index" });
  };
  onReset() {
    this.setState({
      value: "",
      password: ""
    });
  }
  handleSwitchType = type => {
    this.setState({ type, password: "", confirm: "" });
  };
  render() {
    const { type } = this.state;
    return (
      <View className="loginPage">
        <View className="logoView">
          <Image src={globalUrl + "/GaryCareLogo2.png"} className="logo" />
          <View className="logoTitle">GaryCare小程序</View>
        </View>
        <View className="formView">
          <View className="loginInput">
            <AtInput
              name="value"
              type="text"
              placeholder="手机号"
              value={this.state.value}
              onChange={value => this.handleChange(value)}
            />
          </View>
          <View className="loginInput">
            <AtInput
              name="password"
              type="password"
              placeholder="密码"
              value={this.state.password}
              onChange={value => this.handlePasswordChange(value)}
            />
          </View>
          {type === "register" && (
            <View className="loginInput">
              <AtInput
                name="confirm"
                type="password"
                placeholder="确认密码"
                value={this.state.confirm}
                onChange={value => this.handlePasswordConfirm(value)}
              />
            </View>
          )}

          <View className="buttonView">
            <AtButton type="primary" onClick={() => this.onSubmit()}>
              {type === "login" ? "登录" : "注册"}
            </AtButton>
            {type === "login" ? (
              <View
                className="subButton"
                onClick={() => this.handleSwitchType("register")}
              >
                点击注册
              </View>
            ) : (
              <View
                className="subButton"
                onClick={() => this.handleSwitchType("login")}
              >
                返回登录
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    userData: state.gary.userData
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeUpdateStatus: status => {
      dispatch(changeDataUpdateStatus(status));
    },
    changeUserData: status => {
      dispatch(changeUserData(status));
    },
    updateGaryData: data => {
      dispatch(setGaryData(data));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
