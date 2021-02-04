import React from "react";
import { View, Image, Text } from "@tarojs/components";
import { AtActivityIndicator } from "taro-ui";
import Empty from "../../asserts/empty.png";
import "./index.scss";
const EmptyComp = ({ loading }) => {
  return loading ? (
    <AtActivityIndicator
      isOpened={true}
      size={32}
      mode="center"
    ></AtActivityIndicator>
  ) : (
    <View>
      <Image src={Empty} className="emptyImg" />
      <Text className="textStyle">还没有记录</Text>
    </View>
  );
};
export default EmptyComp;
