import {
  GARY_DATA,
  SELECT_DAY,
  IS_DATA_UPDATE,
  USER_DATA,
  GLOBAL_CUSTOM,
} from "../constants/gary";

const INITIAL_STATE = {
  garyData: null,
  selectDay: null,
  isDataUpate: false,
  userData: false,
  globalCustom:null,
};

export default function form(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GARY_DATA:
      return {
        ...state,
        garyData: action.payload
      };
    case SELECT_DAY:
      return {
        ...state,
        selectDay: action.payload
      };
    case IS_DATA_UPDATE:
      return {
        ...state,
        isDataUpate: action.payload
      };
    case USER_DATA:
      return {
        ...state,
        userData: action.payload
      };
    case GLOBAL_CUSTOM:
      return {
        ...state,
        globalCustom: action.payload
      };
    default:
      return state;
  }
}
