import React from 'react';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'HH:mm';

export const getToday = () => {
  return moment().format(dateFormat);
};

export const getTimeNow = () => {
  return moment().format(timeFormat);
};

export const getYesterday=()=>{
    return moment().subtract(1, "days").format(dateFormat);
}