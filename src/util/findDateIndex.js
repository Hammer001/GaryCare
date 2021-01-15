import React from "react";
import _ from "lodash";

export function findDateIndex(array, key) {
  return _.findIndex(array, o => o.date === key);
}
