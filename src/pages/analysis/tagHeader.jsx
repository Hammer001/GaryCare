import React, { Component } from "react";
import { View, Text } from "@tarojs/components";
import { AtTag } from "taro-ui";
import "./analysis.scss";

const usual_tag = [
  { key: 0, keyName: "all", text: "全部", active: true },
  { key: 1, keyName: "weeks", text: "近一周", active: false },
  { key: 2, keyName: "month", text: "近一月", active: false }
];

class TagHeader extends Component {
  state = {
    usualTag: usual_tag
  };

  handleTagChange = (tag, status) => {
    let newTag = this.state.usualTag;
    newTag.map(t => (t.active = false)); //三个当中只有一个可以active
    newTag[tag.key].active = !status.active;
    this.setState({ usualTag: newTag });
    this.props.tagChange(tag.keyName);
  };
  render() {
    return (
      <View className="tagContainer">
        {this.state.usualTag.map(tag => (
          <AtTag
            circle
            size="normal"
            active={tag.active}
            name={tag.text}
            onClick={(name, active) => this.handleTagChange(tag, name)}
          >
            {tag.text}
          </AtTag>
        ))}
      </View>
    );
  }
}

export default TagHeader;
