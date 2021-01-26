import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import _ from "lodash";
import "./about.scss";

class AboutPage extends Component {
  constructor() {
    super(...arguments);
    this.state = {};
  }

  render() {
    return (
      <View className="at-article">
        <View className="at-article__h1">GaryCare</View>
        <View className="at-article__info">2021&nbsp;&nbsp;&nbsp;Hammer</View>
        <View className="at-article__content">
          <View className="at-article__section">
            <View className="at-article__p">方便宝妈们记录未断奶宝宝的记录宝宝所需的日常</View>
            <View className="at-article__p">IT宝爸的贡献</View>
            {/* <View className="at-article__h3">如有喜欢，可以请开发者喝杯咖啡</View>
            <Image
              className="at-article__img"
              src="http://localhost:8080/wechat_pay.png"
              mode="widthFix"
            /> */}
          </View>
        </View>
      </View>
    );
  }
}

export default AboutPage;
