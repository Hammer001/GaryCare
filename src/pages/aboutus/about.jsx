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
            <View className="at-article__h2">
              方便宝妈们记录未断奶宝宝的记录宝宝所需的日常
            </View>
            {/* <View className="at-article__h3">如有喜欢，可以请开发者喝杯咖啡</View>
            <Image
              className="at-article__img"
              src="http://localhost:8080/wechat_pay.png"
              mode="widthFix"
            /> */}
          </View>
          {/* <View className="at-article__section">
            <View className="at-article__p">
              2020年底迎来了自己家的Gary小宝宝，虽然思考了一段时间孩子的问题，但是来的时候依旧是诚惶诚恐，适应了一两个月才逐渐走向正轨。
            </View>
            <View className="at-article__p">
              作为IT奶爸深知其中的麻烦和不容易，比较照顾孩子
            </View>
          </View> */}
        </View>
      </View>
    );
  }
}

export default AboutPage;
