import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Form, View, Text, Button, Right, Input, Title, Body, Item, Icon, Content, Container, Left } from 'native-base';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import DeviceInfo from 'react-native-device-info';
import { connect } from 'react-redux';
import { Header } from '../../components/Index';
import { CountDownButton } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index'
import { ParamsValidate } from '../../../utils/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

class UnLockDevice extends Component {
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
            Toast.show({
                text: msg,
                position: "top",
                textStyle: { textAlign: "center" },
            })
            return;
        }

        // 向后端发起请求
        let params = { mobile: mobile, type: "unbind" }
        Send('api/SendVcode', params).then(res => {
            if (res.code == 200) {
                that.setState({ msgId: res.data.msgId });
                Toast.show({ text: "验证码已发送", position: "top", textStyle: { textAlign: "center" } });
                setTimeout(() => { shouldStartCountting && shouldStartCountting(true) }, 1);
            } else {
                Toast.show({ text: res.message || "验证码发送失败", position: "top", textStyle: { textAlign: "center" } });
            }
        });
    }
    ResetPassword() {
        let vcode = this.state.vcode;
        let vmsg = ParamsValidate('vcode', vcode);
        if (vmsg !== null) {
            Toast.show({
                text: vmsg,
                position: "top",
                textStyle: { textAlign: "center" },
            })
            return false;
        }

        let password = this.state.password;
        let pmsg = ParamsValidate('password', password);
        if (pmsg !== null) {
            Toast.show({
                text: pmsg,
                position: "top",
                textStyle: { textAlign: "center" },
            })
            return false;
        }

        let params = { mobile: this.state.mobile, password: password, verifyCode: vcode, msgId: this.state.msgId }
        params.deviceId = DeviceInfo.getVersion();
        console.log('params', params)
        Send('api/UnbindDevice', params).then(res => {
            if (res.code == 200) {
                Toast.show({
                    text: res.message,
                    position: "top",
                    textStyle: { textAlign: "center" },
                });
                setTimeout(() => Actions.popTo("Login"), 100);
            } else {
                Toast.show({
                    text: res.message,
                    position: "top",
                    textStyle: { textAlign: "center" },
                })
            }
        });
    }

    changebgColor = () => {
        return this.state.mobile > 10;
    }
    render() {
        return (
            <Container>
                <Header title="解绑设备" />
                <LinearGradient colors={[Colors.mainTab, Colors.LightG]} start={{ x: 0, y: 0.1 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
                    <View style={{ paddingLeft: 10, paddingRight: 10, paddingVertical: 5, backgroundColor: "#ffffff" }}>
                        <Text style={{ fontSize: 12, color: Colors.mainTab }}>温馨提示:解绑一次扣除0.5，一年内最多解绑10次</Text>
                    </View>
                    <Form>
                        <Item style={{ borderBottomWidth: StyleSheet.hairlineWidth }}>
                            <Input value={this.state.mobile} style={styles.placeholderText} placeholder="请输入正确的手机号" onChangeText={(value) => this.setState({ mobile: value })} />
                            <Text style={[styles.placeholderText, { marginRight: 20, color: "#2c2c2c" }]}>中国 +86 </Text>
                        </Item>
                        <Item style={{ borderBottomWidth: StyleSheet.hairlineWidth }}>
                            <Input style={styles.placeholderText} placeholder='请输入验证码' onChangeText={(value) => this.setState({ vcode: value })}
                                returnKeyType="done"
                                onSubmitEditing={() => this.ResetPassword()}
                            ></Input>
                            <CountDownButton
                                textStyle={{ color: 'white' }}
                                style={{}}
                                buttonStyle={{}}
                                timerCount={60}
                                timerTitle={'获取验证码'}
                                enable={this.changebgColor()}
                                onClick={
                                    (shouldStartCountting) => {
                                        this.SendVcode(shouldStartCountting)
                                    }}
                                timerEnd={() => { this.setState({ state: '倒计时结束' }) }}
                            />
                        </Item>
                        <Item style={{ borderBottomWidth: StyleSheet.hairlineWidth }}>
                            <Input style={styles.placeholderText} secureTextEntry placeholder='请输入登录密码' onChangeText={(value) => this.setState({ password: value })} />
                        </Item>
                        <View style={styles.submitView}>
                            <TouchableOpacity onPress={() => { this.ResetPassword(); }}>
                                <View style={styles.submitBtn} >
                                    <Text style={{ padding: 15, color: "#ffffff" }}>确定</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Form>
                </LinearGradient>
            </Container>
        );
    }
}
const mapStateToProps = state => ({
    mobile: state.user.mobile
});

const mapDispatchToProps = dispatch => ({
});
export default connect(mapStateToProps, mapDispatchToProps)(UnLockDevice);
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
        width: Metrics.screenWidth * 0.6,
        alignItems: "center",
        borderRadius: 8,
    },
    vcodeButton: {
        marginRight: 5,
        marginTop: 10,
        height: 35,
        backgroundColor: 'orange',
    },
    placeholderText: {
        fontSize: 16,
        color: Colors.White
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
