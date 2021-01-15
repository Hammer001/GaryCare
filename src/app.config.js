export default {
  pages: [
      "pages/index/index", 
      "pages/settings/settings",
      "pages/record/record",
      "pages/note/note",
],
  tabBar: {
    list: [
      {
        pagePath: "pages/index/index",
        iconPath: "asserts/care.png",
        selectedIconPath: "asserts/care_selected.png",
        text: "Care"
      },
      {
        pagePath: "pages/settings/settings",
        iconPath: "asserts/setting.png",
        selectedIconPath: "asserts/setting_selected.png",
        text: "设置"
      }
    ],
    color: "#000",
    selectedColor: "#56abe4",
    backgroundColor: "#fff",
    borderStyle: "white",
    fontSize: "30rpx"
  },
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black"
  }
};
