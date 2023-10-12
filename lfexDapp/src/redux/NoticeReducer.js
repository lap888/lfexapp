/*
 * @Author: top.brids 
 * @Date: 2020-01-15 17:25:58 
 * @Last Modified by: top.brids
 * @Last Modified time: 2020-01-15 17:26:44
 */
import * as ActionTypes from './ActionTypes';

const initialState = {
    id: 0,
    title: "",
    content: "",
    isReaded: true
};

export default NoticeReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.UPDATE_NOTICE_INFO:
            let { id, title, content } = action.payload;
            if (id === state.id) {
                return state
            }
            return {
                ...state,
                id,
                title,
                content,
                isReaded: false
            }
        case ActionTypes.UPDATE_NOTICE_STATUS:
            return {
                ...state,
                isReaded: true
            }
        case ActionTypes.LOGOUT:
            return {
                ...initialState
            }
        default:
            return state;
    }
}