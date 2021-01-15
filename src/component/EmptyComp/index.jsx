import React from "react";
import { View, Image, Text } from "@tarojs/components";
import Empty from "../../asserts/empty.png";

const EmptyComp = ({ jumpTo }) => {
  const textStyle =
    "font-size: 24rpx;color: #78a4fa;display: block;text-align: center;margin-top: 20rpx;";
  return (
    <View
    //onClick={() => jumpTo()}
    >
      <Image src={Empty} style="width:200rpx;height:200rpx" />
      <Text style={textStyle}>还没有记录</Text>
    </View>
  );
};
export default EmptyComp;
