import React, { Component } from 'react';
import { View, StyleSheet, Keyboard, Text, TouchableOpacity, Image, TextInput, Pressable, ScrollView } from 'react-native';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Metrics } from '../../theme/Index';
import { ParamsValidate } from '../../../utils/Index';
import { Header, CountDownButton } from '../../components/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

export default class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mobile: '',
            invitationCode: props.invitationCode,
            vcode: '',
            state: '',
            msgId: '',
            password: '',
            nickName: '',
        };
    }
    SendVcode = (shouldStartCountting) => {
        Keyboard.dismiss();
        let that = this
        let mobile = this.state.mobile;
        // 手机号校验
        let msg = ParamsValidate('mobile', mobile);
        if (msg !== null) {
            Toast.tip(msg)
            return;
        }
        // 向后端发起请求 
        const params = { mobile: mobile, type: "signIn" }
        Send('api/SendVcode', params).then(res => {
            if (res.code == 200) {
                that.setState({ msgId: res.data.msgId });
                Toast.tip('验证码已发送');
                setTimeout(() => { shouldStartCountting && shouldStartCountting(true) }, 1);
            } else {
                Toast.tip(`${res.message || "验证码发送失败"}`);
                setTimeout(() => { shouldStartCountting && shouldStartCountting(false) }, 1);
            }
        });
    }
    
    signUp = () => {
        // 对密码的校验
        let password = this.state.password;
        let passwordMsg = ParamsValidate('password', password);
        if (passwordMsg !== null) {
            Toast.tip(passwordMsg)
            return false;
        }
        // 对昵称的校验
        let nickName = this.state.nickName;
        let nickNameMsg = ParamsValidate('nickName', nickName);
        if (nickNameMsg !== null) {
            Toast.tip(nickNameMsg)
            return false;
        }
        const params = this.state;
        console.log('params',params)
        Send("api/signUp", params).then(res => {
            if (res.code == 200) {
                Toast.tip('注册成功');
                // 后端处理结果
                Actions.replace("Login", { mobile: params.mobile });
            } else {
                Toast.tip(res.message);
            }
        });
    }

    render() {
        const { mobile, vcode, password, nickName } = this.state;
        const registStatus = mobile != '' && vcode != '' && password != '' && nickName != '';
        return (
            <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
                <View style={{alignItems: 'flex-end', marginTop: 20, marginRight: 20}}>
					<Pressable onPress={() => Actions.pop()}>
						<Image source={require('../../images/login/close.png')}/>
					</Pressable>
				</View>
                <View style={{marginLeft: 30}}>
                    <Text style={{fontSize: 28, color: '#034694'}}>Hi!<Text style={{fontSize: 16}}>  Dear lfex users</Text></Text>
                    <Text style={{fontSize: 15, color: '#034694'}}>欢迎来到LFEX平台！</Text>
                </View>
                <View style={{marginLeft: 30}}>
                    <View  style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 30, marginTop: 30}}>
                        <Image source={require('../../images/login/shoujihao.png')} />
                        <View style={{flexDirection: 'row', alignItems: 'center', height: 50, flex: 1, marginLeft: 15, borderBottomWidth: 1, borderBottomColor: Colors.backgroundColor}}>
                            
                            <TextInput 
                                value={mobile}
                                style={styles.text}
                                placeholder="请输入正确的手机号"
                                keyboardType={'number-pad'}
                                onChangeText={(value) => { this.setState({ mobile: value }); }}
                                clearButtonMode="while-editing" />
                            <Text style={{}}> +86   </Text>
                        </View>
                    </View>
                    <View  style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 30, marginTop: 30}}>
                        <Image source={require('../../images/login/yanzhengma.png')} />
                        <View style={{flexDirection: 'row', alignItems: 'center', height: 50, flex: 1, marginLeft: 15, borderBottomWidth: 1, borderBottomColor: Colors.backgroundColor}}>
                            <TextInput 
                                style={styles.text} 
                                value={vcode}
                                placeholder="请输入验证码" 
                                keyboardType={'number-pad'}
                                onChangeText={(value) => this.setState({ vcode: value })}
                                returnKeyType='done'
                                onSubmitEditing={this.signUp} />
                            <CountDownButton
                                textStyle={{fontSize: 14, fontWeight: '600', color: '#034694' }}
                                style={{backgroundColor: Colors.White, width: 90}}
                                buttonStyle={{ fontSize: 16 }}
                                timerCount={60}
                                timerTitle={'获取验证码'}
                                enable={this.state.mobile.length > 10}
                                onClick={(shouldStartCountting) =>  this.SendVcode(shouldStartCountting) }
                                timerEnd={() => this.setState({ state: '倒计时结束' }) } />
                        </View>
                    </View>
                    <View  style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 30, marginTop: 30}}>
                        <Image source={require('../../images/login/nicheng.png')} />
                        <View style={{flexDirection: 'row', alignItems: 'center', height: 50, flex: 1, marginLeft: 15, borderBottomWidth: 1, borderBottomColor: Colors.backgroundColor}}>
                            <TextInput 
                                style={styles.text} 
                                maxLength={15}
                                placeholder="请设置1-15位的昵称" 
                                onChangeText={(value) => this.setState({ nickName: value })} />
                        </View>
                    </View>
                    <View  style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 30, marginTop: 30}}>
                        <Image source={require('../../images/login/password.png')} />
                        <View style={{flexDirection: 'row', alignItems: 'center', height: 50, flex: 1, marginLeft: 15, borderBottomWidth: 1, borderBottomColor: Colors.backgroundColor}}>
                            <TextInput 
                                style={styles.text} 
                                placeholder="请输入6-16位的密码" 
                                secureTextEntry={true} 
                                onChangeText={(value) => this.setState({ password: value })} />
                        </View>
                    </View>
                </View>
                <TouchableOpacity 
                    style={[styles.signUpBtn, {backgroundColor: registStatus ? Colors.mainTab : Colors.greyText}]} 
                    disabled={!registStatus} 
                    onPress={this.signUp}>
                    <Text style={{ fontSize: 16, color: Colors.White }}>立即注册</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }
}
const styles = StyleSheet.create({
    vcodeButton: {
        margin: 5,
        height: 35,
        backgroundColor: 'orange',
    },
    vcodeButtonColor: {
        backgroundColor: 'orange',
    },
    signUpBtn: {
        marginTop: 50,
        marginHorizontal: 40,
        height: 40,
        alignItems: "center",
        justifyContent: 'center',
        borderRadius: 20,
    },
    text: {
        flex: 1,
        fontSize: 16,
        // color: Colors.White,
        height: 40,
        padding: 0,
    },
    header: {
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: '#4cc7ab',
    },
    title: {
        fontSize: 16,
        color: '#ffffff',
    },
    body: {
        backgroundColor: '#4cc7ab',
    },
    imagestyle: {
        width: 22,
        height: 22,
        paddingLeft: 10
    }
})