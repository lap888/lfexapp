/*
 * @Author: top.brids 
 * @Date: 2019-12-21 21:02:57 
 * @Last Modified by: top.brids
 * @Last Modified time: 2020-03-26 22:13:22
 */
import * as ActionTypes from './ActionTypes';
const initialState = {
    logged: false,
    // 收益状态
    golds: 0,
    candyNum: 0,
    candyH: 0,
    candyP: 0,
    rcode: "0",
    level: 0,
    isPay: false,
    isDoTask: false,
    dayNum: 0,
    name: '',
    alipayUid: '',
    auditState: 0,         // 实名认证状态
    // 加载状态
    showIndicator: false,
    location: {
        latitude: '',
        longitude: '',
        provinceCode: '',
        province: '',
        district:'',//区
        city: '',
        cityCode: '',
    }
};

export default UserReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.LOGIN_SUCCESS:
            return {
                ...state,
                ...action.payload.userInfo,
                logged: true
            }
        case ActionTypes.LOGOUT:
            return {
                ...initialState
            }
        case ActionTypes.UPDATE_USER_AVATAR:
            return {
                ...state,
                avatarUrl: action.payload.avatar
            }
        case ActionTypes.SET_USERINFO:
            return {
                ...state,
                ...action.payload.userInfo,
            }
        case ActionTypes.SET_USERNAME:
            return {
                ...state,
                name: action.payload.name
            }
        case ActionTypes.SET_USERMYCONTACTTEL:
            return {
                ...state,
                myContactTel: action.payload.myContactTel
            }
        case ActionTypes.SET_USERMYWECHATNO:
            return {
                ...state,
                myWeChatNo: action.payload.myWeChatNo
            }
        case ActionTypes.SET_USERINVITER:
            return {
                ...state,
                rcode: action.payload.name
            }

        case ActionTypes.UPDATE_USER_LOCATION:
            return {
                ...state,
                location: action.payload.location,
            }
        case ActionTypes.SetPay:
            return {
                ...state,
                isPay: action.payload.isPay,
            }
        case ActionTypes.SetAlipay:
            return {
                ...state,
                isPay: action.payload.alipay,
            }

        case ActionTypes.SetPay2:
            return {
                ...state,
                alipayUid: 'alipayUid',
            }
        case ActionTypes.UPDATE_USER:
            return {
                ...state,
                ...action.payload.userInfo,
            }

        default:
            return state;
    }
}