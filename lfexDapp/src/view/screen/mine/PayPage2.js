import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, NativeModules, Platform } from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Actions } from 'react-native-router-flux';
// import { Toast } from 'native-base';
import { SetPay, SetPay2 } from '../../../redux/ActionTypes';
import { connect } from 'react-redux';
import { Header } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

const AliPay = NativeModules.AliPayModule;
const AlipayIos = NativeModules.Alipay;

class PayPage2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    aliPay() {
        Send('api/UserAli/Auth', {}, 'get').then(res => {
            if (res.code == 200) {
                //生成订单
                let orderStr = res.data;
                if (Platform.OS == "ios") {
                    AlipayIos.pay(orderStr).then((response) => {
                        let { resultStatus, memo } = response;
                        if (resultStatus == "9000") {
                            this.props.setPay2();
                            //接口更新数据
                            Actions.pop();
                        } else {
                            Toast.show({
                                text: memo,
                                position: "top",
                                textStyle: { textAlign: "center" },
                            });
                        }
                    });
                } else {
                    AliPay.payV2(orderStr, (response) => {
                        let { resultStatus, memo } = JSON.parse(response);
                        if (resultStatus == "9000") {
                            this.props.setPay2();
                            //接口更新数据
                            Actions.pop();
                        } else {
                            Toast.show({
                                text: memo,
                                position: "top",
                                textStyle: { textAlign: "center" },
                            });
                        }
                    });
                }
            } else {
                Toast.show({
                    text: res.message,
                    position: "top",
                    textStyle: { textAlign: "center" },
                });
            }
        })
    }

    render() {
        return (
            <View style={{ backgroundColor: Colors.White, flex: 1 }}>
                <Header title="二次认证" />
                <View style={{ alignItems: 'center' }}>
                    <View style={{ marginTop: 60, marginBottom: 40, alignItems: 'center' }}>
                        <FontAwesome name="credit-card" color={Colors.mainTab} size={80} />
                        <Text style={{ color: Colors.mainTab, fontWeight: 'bold', marginTop: 20, fontSize: 20 }}>二次认证</Text>
                        <Text style={{ color: Colors.mainTab, marginTop: 10, fontSize: 18 }}>需要支付0.1元认证费</Text>
                    </View>
                    <TouchableOpacity
                        style={{ borderRadius: 25, borderColor: Colors.Alipay, borderWidth: 1, height: 50, width: Metrics.screenWidth * 0.7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => {
                            this.aliPay();
                        }}
                    >
                        <Image style={{ width: 32, height: 32 }} source={require('../../images/profile/biao.png')} />
                        <Text style={{ fontSize: 18, marginLeft: 20 }}>支付宝支付</Text>
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 20, marginTop: 40, marginTop: 15, fontSize: 14, color: Colors.C16 }}>{`二次认证须知：
\t\t第一：自愿原则
\t\t第二：因平台需要付款到您的支付宝进行秒付款。所以支付宝需要进行实名和支付宝账号进行验证，所以需要二次认证
\t\t第三：二次认证后可以出售散糖给平台
\t\t第四：哟帮可以接现金任务`}</Text>
                </View>
            </View>
        );
    }
}
const mapStateToProps = state => ({
    name: state.user.name,
});
const mapDispatchToProps = disPatch => ({
    setPay2: () => disPatch({ type: SetPay2 })
});
export default connect(mapStateToProps, mapDispatchToProps)(PayPage2);
