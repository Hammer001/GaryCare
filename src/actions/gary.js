import { GARY_DATA,SELECT_DAY,IS_DATA_UPDATE } from "../constants/gary";

export const setGaryData = value => {
  return {
    type: GARY_DATA,
    payload: value
  };
};

export const setSelectDay = value => {
  return {
    type: SELECT_DAY,
    payload: value
  };
};
export const changeDataUpdateStatus = value => {
  return {
    type: IS_DATA_UPDATE,
    payload: value
  };
};
