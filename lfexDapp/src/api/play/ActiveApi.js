import { Send } from "../../utils/Http";
import { Toast } from "../../view/common";
let ActiveApi = {};

ActiveApi.getActiveList = (source) => {
    return new Promise((resolve, reject) => {
        Send(`api/system/banners?source=${source}`, {}, 'GET')
        .then((res) => {
            if (res.code == 200) {
                resolve(res.data)
            }else{
                reject(res)
                Toast.tipTop(res.message);
            }
        })
        .catch((err) =>{
            reject(err)
            console.log('err', err)
        })
    })
}



export default ActiveApi;