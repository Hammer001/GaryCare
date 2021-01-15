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
