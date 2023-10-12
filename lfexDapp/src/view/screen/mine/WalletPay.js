import React, { Component } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList,
    TextInput, Keyboard, NativeModules, Platform
} from 'react-native';
// import { Toast } from 'native-base';
const AliPay = NativeModules.AliPayModule;
const AlipayIos = NativeModules.Alipay;
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import { Header } from '../../components/Index';
import { connect } from 'react-redux';
import { LOGOUT } from '../../../redux/ActionTypes';
import { Colors, Metrics } from '../../theme/Index';
import { SetAlipay } from '../../../redux/ActionTypes';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

class WalletPay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alipay: ""
        };
    }
    loginOut() {
        this.props.logout();
        Actions.Login({ relogin: "resetPwd" });
    }
    /**
     * 重置登陆密码
     */
    resetTradePed() {
        Keyboard.dismiss();

        let alipay = this.state.alipay;
        /* 非空校验 */
        if (alipay.length === 0) {
            Toast.show({
                text: "金额不可为空",
                position: "top",
                textStyle: { textAlign: "center" },
            })
            return;
        }

        Send(`api/WallerRecharge?amount=${alipay}`, {}, 'get').then(res => {
            if (res.code == 200) {
                let orderStr = res.data;
                if (Platform.OS == "ios") {
                    AlipayIos.pay(orderStr).then((response) => {
                        let { resultStatus, memo } = response;//JSON.parse(response);
                        if (resultStatus == "9000") {
                            this.props.modifyAlipay(alipay);
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
                            this.props.modifyAlipay(alipay);
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
                    text: '充值失败',
                    position: "top",
                    textStyle: { textAlign: "center" }
                })
            }
        })
    }
    render() {
        return (
            <View style={styles.businessPwdPageView}>
                <Header title="钱包充值" />
                <LinearGradient colors={[Colors.mainTab, Colors.LightG]} start={{ x: 0, y: 0.1 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
                    <View style={styles.pwdViewStyle}>
                        <View style={{ paddingVertical: 5, backgroundColor: "#ffffff" }}>
                            <Text style={{ color: Colors.mainTab, fontSize: 14, }}>
                                提示: 提现需要手续费用多少充多少
						</Text>
                        </View>
                        <TextInput style={styles.inputViewStyle}
                            placeholder="请输入充值金额"
                            autoCapitalize="none"
                            clearButtonMode="always"
                            keyboardType="numeric"
                            onChangeText={(text) => {
                                this.setState({
                                    alipay: text
                                })
                            }}
                        />
                        <View style={styles.submitView}>
                            <TouchableOpacity onPress={() => { this.resetTradePed() }}>
                                <View style={styles.submitBtn} >
                                    <Text style={{ padding: 15, color: "#ffffff" }}>
                                        确认
									</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    userId: state.user.id,
});

const mapDispatchToProps = dispatch => ({
    modifyAlipay: (alipay) => dispatch({ type: SetAlipay, payload: { alipay: alipay } }),
});

export default connect(mapStateToProps, mapDispatchToProps)(WalletPay);

// 样式
const styles = StyleSheet.create({
    businessPwdPageView: {
        backgroundColor: "#ffffff",
        height: Metrics.screenHeight * 1,
    },
    pwdViewStyle: {
        padding: 10,
    },
    inputViewStyle: {
        height: 48,
        paddingLeft: 10,
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: Colors.LightG,
    },
    submitView: {
        height: Metrics.screenHeight * 0.4,
        justifyContent: 'center',
        alignItems: "center",
    },
    submitBtn: {
        backgroundColor: Colors.mainTab,
        width: Metrics.screenWidth * 0.6,
        alignItems: "center",
        borderRadius: 8,
    },
})