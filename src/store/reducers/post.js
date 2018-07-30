// import { createReducer } from '../utils/reactUtil'
import { GET_POST_DATA } from '../constants'
import { fromJS } from 'immutable'

const initialState = fromJS([{
    test:1111
}])

export const postData = (state = initialState, action) => {
    switch (action.type) {
        case GET_POST_DATA:
            return state;
        default:
            return state;
    }
}
