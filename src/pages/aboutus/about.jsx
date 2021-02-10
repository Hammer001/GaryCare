import React, { Component } from "react";
import Taro from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import { AtImagePicker, AtButton } from "taro-ui";
import { newRequest } from "../../util/requestUtil";
import _ from "lodash";
import "./about.scss";

class AboutPage extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      files: []
    };
  }

//   onChange(files) {
//     console.log(files);
//     this.setState({
//       files
//     });

//     let params = {
//       url: files[0].url
//     };
//     newRequest("/upload/img", params).then(data => {
//       console.log("data");
//     });
//   }
//   onFail(mes) {
//     console.log(mes);
//   }
//   onImageClick(index, file) {
//     console.log(index, file);
//   }

//   handleUploadImg = () => {
//     Taro.chooseImage({
//       success(res) {
//         const tempFilePaths = res.tempFilePaths;
//         console.log(res);
//         Taro.uploadFile({
//           url: "http://localhost:8080/upload/img", //仅为示例，非真实的接口地址
//           filePath: tempFilePaths[0],
//           name: "file",
//           formData: {
//             user: "test",
//             imgData: res.tempFilePaths
//           },
//           success(res) {
//             const data = res.data;
//             console.log(res);
//             //do something
//           }
//         });
//       }
//     });
//   };

  render() {
    return (
      <View className="at-article">
        <View className="at-article__h1">GaryCare</View>
        <View className="at-article__info">2021&nbsp;&nbsp;&nbsp;Hammer</View>
        <View className="at-article__content">
          <View className="at-article__section">
            <View className="at-article__h2">
              方便宝妈们记录宝宝所需的日常健康数据
            </View>
            {/* <View className="at-article__h3">如有喜欢，可以请开发者喝杯咖啡</View>
            <Image
              className="at-article__img"
              src="http://localhost:8080/wechat_pay.png"
              mode="widthFix"
            /> */}
          </View>
          <View className="at-article__section">
            <View className="at-article__p">欢迎提出宝贵意见</View>
            <View className="at-article__p">Email: hammer-liu@qq.com</View>
          </View>
        </View>

        {/* <AtImagePicker
          mode="top"
          files={this.state.files}
          onChange={this.onChange.bind(this)}
          onFail={this.onFail.bind(this)}
          onImageClick={this.onImageClick.bind(this)}
        /> */}
        {/* <AtButton onClick={() => this.handleUploadImg()}>UPLOAD</AtButton> */}
      </View>
    );
  }
}

export default AboutPage;
