import { GARY_DATA,SELECT_DAY,IS_DATA_UPDATE } from '../constants/gary'

const INITIAL_STATE = {
  garyData: null,
  selectDay:null,
  isDataUpate:false,
}

export default function form (state = INITIAL_STATE, action) {
  switch (action.type) {
    case GARY_DATA:
      return {
        ...state,
        garyData: action.payload
      }
    case SELECT_DAY:
      return {
        ...state,
        selectDay: action.payload
      }
    case IS_DATA_UPDATE:
      return {
        ...state,
        isDataUpate: action.payload
      }
     default:
       return state
  }
}
