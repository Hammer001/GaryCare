"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WeekSwiper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _class, _temp2;

var _index = require("@tarojs/taro-weapp/index.js");

var _index2 = _interopRequireDefault(_index);

var _moment = require("moment/moment.js");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WeekSwiper = exports.WeekSwiper = (_temp2 = _class = function (_BaseComponent) {
  _inherits(WeekSwiper, _BaseComponent);

  function WeekSwiper() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, WeekSwiper);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = WeekSwiper.__proto__ || Object.getPrototypeOf(WeekSwiper)).call.apply(_ref, [this].concat(args))), _this), _this.$usedState = ["anonymousState__temp", "loopArray0", "loopArray1", "loopArray2", "swiperIdx", "selectedDate", "$anonymousCallee__0", "$anonymousCallee__1", "$anonymousCallee__2", "dates", "date", "backgroundColor", "color"], _this.clickDay = function (day) {
      var onChange = _this.props.onChange;

      _this.setState({ selectedDate: day });
      if (!!onChange) {
        _this.props.onChange(day);
      }
    }, _this.customComponents = [], _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(WeekSwiper, [{
    key: "_constructor",
    value: function _constructor(props) {
      _get(WeekSwiper.prototype.__proto__ || Object.getPrototypeOf(WeekSwiper.prototype), "_constructor", this).call(this, props);

      this.state = {
        selectedDate: this.props.date,
        dates: [],
        swiperIdx: 1
      };
      this.$$refs = [];
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {
      var selectedDate = this.state.selectedDate;

      this.dayChange(selectedDate);
    }
  }, {
    key: "dayChange",
    value: function dayChange(date) {
      var onChange = this.props.onChange;

      var momentObj = (0, _moment2.default)(date);
      var selectedDay = momentObj.day();
      momentObj.subtract(selectedDay, "days");
      var curStartDate = momentObj.format("YYYY-MM-DD");
      var dates = [momentObj.subtract(7, "days").format("YYYY-MM-DD")];
      for (var i = 0; i < 20; i++) {
        dates[dates.length] = momentObj.add(1, "days").format("YYYY-MM-DD");
      }
      this.setState({ dates: dates, swiperIdx: 1, curStartDate: curStartDate });
      if (!!onChange) {
        this.props.onChange(date);
      }
    }
  }, {
    key: "onSwiperChange",
    value: function onSwiperChange(e) {
      var _state = this.state,
          swiperIdx = _state.swiperIdx,
          curStartDate = _state.curStartDate,
          dates = _state.dates,
          selectedDate = _state.selectedDate;
      var onChange = this.props.onChange;

      var oIndex = e.detail.current;
      var ind = oIndex - swiperIdx;
      var curDate = (0, _moment2.default)(curStartDate);
      var weekDay = (0, _moment2.default)(selectedDate).day();
      var updated = false;
      //向左滑动
      if (ind === 1 || ind === -2) {
        var dateArr = [];
        curDate.add(13, "days");
        var j = oIndex + 1 === 3 ? 0 : (oIndex + 1) * 7;
        for (var i = 0; i < 7; i++) {
          dateArr[dateArr.length] = curDate.add(1, "days").format("YYYY-MM-DD");
        }
        dates.splice.apply(dates, [j, 7].concat(dateArr));
        selectedDate = dates[oIndex * 7 + weekDay];
        this.setState({
          dates: dates,
          swiperIdx: oIndex,
          curStartDate: (0, _moment2.default)(curStartDate).add(7, "days").format("YYYY-MM-DD"),
          selectedDate: selectedDate
        });
        updated = true;
      }
      //向右滑动
      if (ind === -1 || ind === 2) {
        var _dateArr = [];
        curDate.subtract(15, "days");
        for (var _i = 0; _i < 7; _i++) {
          _dateArr[_dateArr.length] = curDate.add(1, "days").format("YYYY-MM-DD");
        }
        dates.splice.apply(dates, [(oIndex - 1 === -1 ? 2 : oIndex - 1) * 7, 7].concat(_dateArr));
        selectedDate = dates[oIndex * 7 + weekDay];
        this.setState({
          dates: dates,
          swiperIdx: oIndex,
          curStartDate: (0, _moment2.default)(curStartDate).subtract(7, "days").format("YYYY-MM-DD"),
          selectedDate: selectedDate
        });
        updated = true;
      }
      if (!updated) {
        selectedDate = dates[oIndex * 7 + weekDay];
        this.setState({ selectedDate: selectedDate });
      }
      if (!!onChange) {
        this.props.onChange(selectedDate);
      }
    }
  }, {
    key: "_createData",
    value: function _createData() {
      this.__state = arguments[0] || this.state || {};
      this.__props = arguments[1] || this.props || {};
      var __isRunloopRef = arguments[2];
      var __prefix = this.$prefix;
      ;

      var _props = this.__props,
          backgroundColor = _props.backgroundColor,
          color = _props.color;
      var _state2 = this.__state,
          dates = _state2.dates,
          swiperIdx = _state2.swiperIdx,
          selectedDate = _state2.selectedDate;

      var format = function format(val) {
        if (val === selectedDate) {
          var diff = (0, _moment2.default)().startOf('day').diff(selectedDate, 'days');
          var ret = '';
          switch (diff) {
            case 0:
              ret = '今';
              break;
            case 1:
              ret = '昨';
              break;
            case -1:
              ret = '明';
              break;
            default:
              ret = (0, _moment2.default)(val).format("M/D");
              break;
          }
          return ret;
        } else {
          return (0, _moment2.default)(val).format('DD');
        }
        return (0, _moment2.default)(val).format(val === selectedDate ? (0, _moment2.default)().format("YYYY-MM-DD") === selectedDate ? "今" : "M/D" : "DD");
      };
      var anonymousState__temp = (0, _index.internal_inline_style)({ backgroundColor: backgroundColor, color: color });
      var $anonymousCallee__0 = dates.slice(0, 7);
      var $anonymousCallee__1 = dates.slice(7, 14);
      var $anonymousCallee__2 = dates.slice(14, 21);
      var loopArray0 = dates.slice(0, 7).map(function (val, _anonIdx) {
        val = {
          $original: (0, _index.internal_get_original)(val)
        };
        var $loopState__temp3 = (0, _index.internal_inline_style)(val.$original === selectedDate ? { backgroundColor: color, color: backgroundColor } : undefined);
        var $loopState__temp5 = format(val.$original);
        return {
          $loopState__temp3: $loopState__temp3,
          $loopState__temp5: $loopState__temp5,
          $original: val.$original
        };
      });
      var loopArray1 = dates.slice(7, 14).map(function (val, _anonIdx3) {
        val = {
          $original: (0, _index.internal_get_original)(val)
        };
        var $loopState__temp7 = (0, _index.internal_inline_style)(val.$original === selectedDate ? { backgroundColor: color, color: backgroundColor } : undefined);
        var $loopState__temp9 = format(val.$original);
        return {
          $loopState__temp7: $loopState__temp7,
          $loopState__temp9: $loopState__temp9,
          $original: val.$original
        };
      });
      var loopArray2 = dates.slice(14, 21).map(function (val, _anonIdx5) {
        val = {
          $original: (0, _index.internal_get_original)(val)
        };
        var $loopState__temp11 = (0, _index.internal_inline_style)(val.$original === selectedDate ? { backgroundColor: color, color: backgroundColor } : undefined);
        var $loopState__temp13 = format(val.$original);
        return {
          $loopState__temp11: $loopState__temp11,
          $loopState__temp13: $loopState__temp13,
          $original: val.$original
        };
      });
      Object.assign(this.__state, {
        anonymousState__temp: anonymousState__temp,
        loopArray0: loopArray0,
        loopArray1: loopArray1,
        loopArray2: loopArray2,
        $anonymousCallee__0: $anonymousCallee__0,
        $anonymousCallee__1: $anonymousCallee__1,
        $anonymousCallee__2: $anonymousCallee__2
      });
      return this.__state;
    }
  }]);

  return WeekSwiper;
}(_index.Component), _class.$$events = ["onSwiperChange", "clickDay"], _class.$$componentPath = "components/WeekSwiper/index", _temp2);

WeekSwiper.options = {
  addGlobalClass: true
};
WeekSwiper.defaultProps = {
  backgroundColor: '#19be6b',
  color: '#fff',
  date: (0, _moment2.default)().format("YYYY-MM-DD")
};
exports.default = WeekSwiper;

Component(require('@tarojs/taro-weapp/index.js').default.createComponent(WeekSwiper));