import React from "react";
import { View, Text } from "@tarojs/components";
import "../component.scss";

const TitleComp = ({ title }) => {
  return (
    <View className="titleCompView">
      <Text className="titleText">{title}</Text>
    </View>
  );
};

export default TitleComp;
