import { combineReducers } from "redux";
import counter from "./counter";
import gary from "./gary";

export default combineReducers({
  counter,
  gary
});
