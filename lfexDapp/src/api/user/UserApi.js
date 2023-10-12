import { Send } from "../../utils/Http";
import { Toast } from "../../view/common";
// import { Toast } from "native-base";
let UserApi = {};


UserApi.getEquityDetail = (mobile) => { // mobile
    return new Promise((resolve, reject) => {
        Send(`api/GetUserByMobile?mobile=${mobile}`, {}, 'get')
        .then((res) => {
            if (res.code == 200) {
                resolve(res)
            }else {
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}


UserApi.setContact = (params) => { // mobile
    return new Promise((resolve, reject) => {
        Send(`api/SetContact`, params)
        .then((res) => {
            if (res.code == 200) {
                resolve(res)
            }else {
                Toast.tipTop(res.message)
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}




export default UserApi