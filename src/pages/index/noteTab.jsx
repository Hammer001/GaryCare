import React from "react";
import { View, Text } from "@tarojs/components";
import { AtIcon, AtDivider, AtButton } from "taro-ui";
import EmptyComp from "../../component/EmptyComp";
import _ from "lodash";
import "./index.scss";

const NoteTab = ({ noteData, goEdit, isEmptyContent }) => {
  return (
    <View>
      <View className="at-article">
        <View className="at-article__p noteData">{noteData}</View>
      </View>

      {!isEmptyContent && (
        <AtDivider lineColor="#f5f5f5">
          <View className="noteEditButton" onClick={() => goEdit()}>
            <AtIcon value="edit" size="14" color="#78a4fa"></AtIcon>
            <Text style="color:#78a4fa">编辑</Text>
          </View>
        </AtDivider>
      )}

      {isEmptyContent && (
        <View className="emptyContentView">
          <EmptyComp />
        </View>
      )}
    </View>
  );
};

export default NoteTab;
