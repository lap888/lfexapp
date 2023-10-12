import React, { Component } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Header } from '../../components/Index';
import { CountDownButton } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index'
import { ParamsValidate } from '../../../utils/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

export default class Password extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mobile: '',
            password: '',
            vcode: '',
            msgId: '',
        };
    }
    SendVcode = (shouldStartCountting) => {
        let that = this;
        let mobile = this.state.mobile;
        // 手机号格式校验
        let msg = ParamsValidate('mobile', mobile);
        if (msg !== null) {
            Toast.tipTop(msg)
            return;
        }

        // 向后端发起请求
        let params = { mobile: mobile, type: "resetPassword" }
        Send('api/SendVcode', params).then(res => {
            if (res.code == 200) {
                that.setState({ msgId: res.data.msgId });
                Toast.tipTop('验证码已发送')
                setTimeout(() => { shouldStartCountting && shouldStartCountting(true) }, 1);
            } else {
                Toast.tipTop(res.message || "验证码发送失败");
                setTimeout(() => { shouldStartCountting && shouldStartCountting(false) }, 1);
            }
        });
    }
    ResetPassword() {
        let vcode = this.state.vcode;
        let vmsg = ParamsValidate('vcode', vcode);
        if (vmsg !== null) {
            Toast.tipTop(vmsg)
            return false;
        }

        let password = this.state.password;
        let pmsg = ParamsValidate('password', password);
        if (pmsg !== null) {
            Toast.tipTop(pmsg)
            return false;
        }

        let params = { mobile: this.state.mobile, password: password, vcode: vcode, msgId: this.state.msgId }
        Send('api/ForgetLoginPwd', params).then(res => {
            if (res.code == 200) {
                Toast.tipTop('修改密码成功')
                setTimeout(() => Actions.popTo("Login", { mobile: params.mobile }), 1);
            } else {
                Toast.tipTop(res.message)
            }
        });
    }

    changebgColor = () => {
        return this.state.mobile.length > 10;
    }
    render() {
        return (
            <View>
                <Header title="找回密码" />
                <View style={{paddingHorizontal: 15}}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth }}>
                        <TextInput 
                            value={this.state.mobile} 
                            style={styles.placeholderText} 
                            keyboardType='number-pad'
                            placeholder="请输入正确的手机号" 
                            onChangeText={(value) => this.setState({ mobile: value })} 
                            />
                        <Text style={{ marginRight: 20, color: "#2c2c2c" }}>中国 +86 </Text>
                    </View>
                    <View style={{ height: 50, borderBottomWidth: StyleSheet.hairlineWidth }}>
                        <TextInput 
                            style={styles.placeholderText} 
                            secureTextEntry={true}
                            placeholder='请输入6-16位的新登录密码' 
                            onChangeText={(value) => this.setState({ password: value })} 
                            />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth }}>
                        <TextInput 
                            style={styles.placeholderText}
                            placeholder='请输入验证码'
                            onChangeText={(value) => this.setState({ vcode: value })}
                            returnKeyType="done"
                            keyboardType='number-pad'
                            onSubmitEditing={() => this.ResetPassword()}
                        />
                        <CountDownButton
                            textStyle={{ fontSize: 14, color: Colors.White }}
                            style={{height: 35}}
                            buttonStyle={{backgroundColor: Colors.main}}
                            timerCount={60}
                            timerTitle={'获取验证码'}
                            enable={this.changebgColor()}
                            onClick={
                                (shouldStartCountting) => {
                                    this.SendVcode(shouldStartCountting)
                                }}
                            timerEnd={() => { this.setState({ state: '倒计时结束' }) }}
                        />
                    </View>
                    <View style={styles.submitView}>
                        <TouchableOpacity style={styles.submitBtn} onPress={() => { this.ResetPassword(); }}>
                            <Text style={{fontSize: 16, color: "#ffffff" }}>确定</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#4cc7ab',
        justifyContent: "space-between",
        alignItems: "center",
    },
    body: {
        backgroundColor: '#ffffff',
    },
    submitView: {
        height: Metrics.screenHeight * 0.3,
        justifyContent: 'center',
        alignItems: "center",
    },
    submitBtn: {
        backgroundColor: Colors.mainTab,
        height: 40,
        width: Metrics.screenWidth * 0.6,
        alignItems: "center",
        borderRadius: 20,
        justifyContent: 'center',
    },
    vcodeButton: {
        marginRight: 5,
        marginTop: 10,
        height: 35,
        backgroundColor: 'orange',
    },
    placeholderText: {
        flex: 1,
        fontSize: 16,
        // color: Colors.White
    },
    text: {
        fontSize: 16,
        color: '#ffffff',
        padding: 5
    },
    imagestyle: {
        width: 22,
        height: 22,
        paddingLeft: 10
    },
    clearIcon: {
        width: 20,
        height: 20
    }
})
