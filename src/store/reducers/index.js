import { combineReducers } from 'redux-immutable'
import { routerReducer } from 'react-router-redux'

import { postData } from './post'

export default combineReducers({
    // routerReducer,
    postData
})