import React, { Component } from "react";
import { View, Text } from "@tarojs/components";
import { AtTag } from "taro-ui";
import "../component.scss";

class TagHeader extends Component {
  state = {
    usualTag: this.props.tagData
  };

  handleTagChange = (tag, status) => {
    let newTag = this.state.usualTag;
    newTag.map(t => (t.active = false)); //三个当中只有一个可以active
    newTag[tag.key].active = !status.active;
    this.setState({ usualTag: newTag });
    this.props.tagChange(tag.keyName);
  };
  render() {
    const { size, type, page } = this.props;
    return (
      <View className={page === "record" ? "sleepContainer" : "tagContainer"}>
        {this.state.usualTag.map(tag => (
          <AtTag
            circle
            size={size}
            type={type || ""}
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
