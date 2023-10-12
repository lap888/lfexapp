import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, NativeModules, Platform } from 'react-native';
import Icon from "react-native-vector-icons/AntDesign";
import { Actions } from 'react-native-router-flux';
import { SetPay, SET_USERINFO } from '../../../redux/ActionTypes';
import { connect } from 'react-redux';
import { Header } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import { Send } from '../../../utils/Http';
import Advert from '../advert/Advert';
import { Toast } from '../../common';
const AliPay = NativeModules.AliPayModule;
const AlipayIos = NativeModules.Alipay;
// const { RNMobad } = NativeModules;

class PayPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            num: props.totalWatch,
            rule: ''
        };
    }

    componentDidMount() {
        Send(`api/system/CopyWriting?type=real_name_rule`, {}, 'get').then(res => {
            if (res.code === 200) {
                this.setState({rule: res.data });
            }
        });
    }



    aliPay() {
        Send('api/HavePayOrder', {}, 'get').then(res => {
            if (res.code == 200) {
                this.props.setPay(true);
                //接口更新数据
                Actions.push('Certification')
            } else {
                Send('api/GenerateAppUrl', {}, 'get').then(res => {
                    if (res.code == 200) {
                        //生成订单
                        let orderStr = res.data;
                        if (Platform.OS == "ios") {
                            AlipayIos.pay(orderStr).then((response) => {
                                let { resultStatus, memo, result } = response;
                                if (resultStatus == "9000") {
                                    result = JSON.parse(result);
                                    let out_trade_no = result.alipay_trade_app_pay_response.out_trade_no;
                                    Send('api/PayFlag?outTradeNo=' + out_trade_no, {}, 'get').then(res => {
                                        if (res.code == 200) {
                                            this.props.setPay(true);
                                            //接口更新数据
                                            Actions.push('Certification')
                                        } else {
                                            Toast.tipTop(res.message)
                                        }
                                    });
                                } else {
                                    Toast.tipTop(memo)
                                }
                            });
                        } else {
                            AliPay.payV2(orderStr, (response) => {
                                let { resultStatus, memo, result } = JSON.parse(response);
                                if (resultStatus == "9000") {
                                    result = JSON.parse(result);
                                    let out_trade_no = result.alipay_trade_app_pay_response.out_trade_no;
                                    Send('api/PayFlag?outTradeNo=' + out_trade_no, {}, 'get').then(res => {
                                        if (res.code == 200) {
                                            this.props.setPay(true);
                                            //接口更新数据
                                            Actions.push('Certification')
                                        } else {
                                            Toast.tipTop(res.message)
                                        }
                                    });
                                } else {
                                    Toast.tipTop(memo)
                                }
                            });
                        }
                    } else {
                        Toast.tipTop(res.message)
                    }
                })
            }
        });
    }

    seeAd = () => {
        callback = (res) => {
            if (res) {
                Send(`api/RealNameAd`, {}, 'get').then(res => {
                    if (res.code === 200) {
                        this.setState({num: res.data.totalWatch ? res.data.totalWatch : this.state.num + 1})
                        this.props.resetUserInfo({totalWatch: res.data.totalWatch})
                    }
                });
            }
        }
        if (Platform.OS === 'android') {
            Advert.rewardVideo(callback)
        }else {
            // RNMobad.showAd();
            setTimeout(()=>{
                Send(`api/RealNameAd`, {}, 'get').then(res => {
                    if (res.code === 200) {
                        this.setState({num: res.data.totalWatch ? res.data.totalWatch : this.state.num + 1})
                        this.props.resetUserInfo({totalWatch: res.data.totalWatch})
                    }
                });
            }, 10000)
        }
    }

    render() {
        return (
            <View style={{ backgroundColor: Colors.White, flex: 1 }}>
                <Header title="实名认证" />
                <View style={{ alignItems: 'center' }}>
                    <View style={{ marginTop: 60, marginBottom: 40, alignItems: 'center' }}>
                        <Icon name="idcard" color={Colors.mainTab} size={80} />
                        <Text style={{ color: Colors.mainTab, fontWeight: 'bold', marginTop: 20, fontSize: 20 }}>实名认证</Text>
                        {/* <Text style={{ color: Colors.mainTab, marginTop: 10, fontSize: 18 }}>需要支付1.5元认证费</Text> */}
                        <Text style={{ color: Colors.mainTab, marginTop: 10, fontSize: 18 }}>账户更安全</Text>
                    </View>
                    <TouchableOpacity
                        style={{ borderRadius: 25, marginTop: 10, borderColor: Colors.Alipay, borderWidth: 1, height: 50, width: Metrics.screenWidth * 0.7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => {
                            if (this.state.num >= 10) {
                                this.props.setPay(true);
                                Actions.replace('Certification')
                                return ;
                            }
                            this.seeAd()
                        }}>
                        <Icon name="play" color={Colors.Wxpay} size={32} />
                        <Text style={{ fontSize: 18, marginLeft: 20 }}>{`免费认证(${this.state.num}/10)`}</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        style={{ borderRadius: 25, borderColor: Colors.Alipay, borderWidth: 1, height: 50, width: Metrics.screenWidth * 0.7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => {
                            this.aliPay();
                        }}
                    >
                        <Image style={{ width: 32, height: 32 }} source={require('../../images/profile/biao.png')} />
                        <Text style={{ fontSize: 18, marginLeft: 20 }}>支付宝支付</Text>
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity
                        style={{ borderRadius: 25, marginTop: 10, borderColor: Colors.Alipay, borderWidth: 1, height: 50, width: Metrics.screenWidth * 0.7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => {
                            Toast.show({
                                text: "通道未开放",
                                position: "top",
                                textStyle: { textAlign: "center" },
                            })
                        }}
                    >
                        <Icon name="wechat" color={Colors.Wxpay} size={32} />
                        <Text style={{ fontSize: 18, marginLeft: 20 }}>微 信 支 付</Text>
                    </TouchableOpacity> */}
                    <Text style={{ marginLeft: 20, marginTop: 40, marginTop: 15, fontSize: 14, color: Colors.C16 }}>{this.state.rule}</Text>
                    {/* <Text style={Styles.ruleText} >{this.state.rule}</Text> */}
                </View>
                <View>
                    {/* {
                        this.state.rule.map && this.state.rule.map((item,index) => 
                            <View style={Styles.ruleContainer} key={item['key']}>
                                <View style={Styles.verticalLine} />
                                <View style={{ marginLeft: 6 }}>
                                    <Text style={{ color: Colors.C0, fontSize: 16, fontWeight:'300' }}>{item['title']}</Text>
                                    <Text style={Styles.ruleText}>{item['text']}</Text>
                                </View>
                            </View>
                        )
                    } */}
                </View>
            </View>
        );
    }
}
const mapStateToProps = state => ({
    name: state.user.name,
    isPay: state.user.isPay,
    totalWatch: state.user.totalWatch,
});
const mapDispatchToProps = dispatch => ({
    setPay: (isPay) => dispatch({ type: SetPay, payload: { isPay: isPay } }),
    resetUserInfo: userInfo => dispatch({ type: SET_USERINFO, payload: { userInfo } }),
});

const Styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.C8 },
    ruleContainer: { flexDirection: 'row', paddingLeft: 15, paddingRight: 15, paddingTop: 20 },
    ruleText: { marginTop: 10, fontSize: 14, lineHeight: 19, color: Colors.C16 },
    verticalLine: { height: 12, width: 12, borderRadius: 25, backgroundColor: Colors.mainTab,marginTop:2 },
});

export default connect(mapStateToProps, mapDispatchToProps)(PayPage);
