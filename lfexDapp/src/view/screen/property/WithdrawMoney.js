import React, { Component } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { Header, CountDownButton } from '../../components/Index';
import { Colors } from '../../theme/Index';
import { C10 } from '../../theme/Colors';
import { Coin } from '../../../api';
import { Toast, Loading, RegExp } from '../../common';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';

class WithdrawMoney extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            isLoading: false,
            state: '',
            channel: 'YYB',
            coinName: props.data.name,
            coinAmount: '',
            adress: '',
            remark: '',
            mobile: '',
            msgId: '',
            verifyCode: '',
            password: ''
        };
    }

    setAmount = (value) => {
        if (RegExp.integer.test(value) || value === '') {
            this.setState({coinAmount: value});
        }
    }


    getCode = (shouldStartCountting) => {
        Coin.moveCoinSendCode(this.props.mobile)
        .then((data) => {
            this.setState({ msgId: data.msg_Id });
            Toast.tip('验证码已发送');
            setTimeout(() => { shouldStartCountting && shouldStartCountting(true) }, 1);
        }).catch((err) => setTimeout(() => { shouldStartCountting && shouldStartCountting(false) }, 1))
    }

    post = () => {
        const {data, coinName, coinAmount, adress, msgId, verifyCode, password } = this.state;
        if (adress == '') {
            Toast.tip('请输入交易地址')
            return ;
        }
        if (coinAmount == '') {
            Toast.tip('请输入提币数量')
            return ;
        }
        if (Number(coinAmount) < data.minCanMove) {
            Toast.tip(`最低提币数量为${data.minCanMove}`)
            return ;
        }
        if (msgId == '') {
            Toast.tip('请点击获取验证码进行验证')
            return ;
        }
        if (verifyCode == '') {
            Toast.tip('请输入验证码')
            return ;
        }
        if (password == '') {
            Toast.tip('请输入验证码')
            return ;
        }
        this.setState({ isLoading: true }, () => {
            Coin.moveCoinToSomeone({coinName, coinAmount: Number(coinAmount), adress, mobile: this.props.mobile, msgId, verifyCode, password})
            .then((data) => {
                Actions.pop();
                Toast.tip('提交成功')
            }).catch((err) => this.setState({isLoading: false}))
        })
        
    }

    render() {
        const { data } = this.state;
        const daozhang = Number(this.state.coinAmount) - data.fee;
        return (
            <View style={{flex: 1}}>
                <Header title={'提币'} />
                <KeyboardAvoidingView style={{flex:1}}  behavior={Platform.OS==='ios'?'padding':''} enabled={Platform.OS!=='android'}>
                    <ScrollView style={{paddingHorizontal: 15}}>
                        <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 15}}>币种： {data.name}</Text>
                        <View style={{marginTop: 15, marginBottom: 5, paddingHorizontal: 10, borderRadius: 3, backgroundColor: Colors.C13, height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text>{data.name}</Text>
                            <Text>币种协议</Text>
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text style={{fontSize: 14, color: Colors.C12}}>提币地址</Text>
                            <View style={{height: 50, borderBottomColor: Colors.C13, borderBottomWidth: 1, }}>
                                <TextInput
                                    style={{flex: 1}}
                                    placeholder={'区块链地址'}
                                    value={this.state.adress}
                                    onChangeText={(value) => this.setState({adress: value})}
                                />
                            </View>
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text style={{fontSize: 14, color: Colors.C12}}>备注</Text>
                            <View style={{height: 50, borderBottomColor: Colors.C13, borderBottomWidth: 1, }}>
                                <TextInput
                                    style={{flex: 1}}
                                    placeholder={'钱包交易所等地址备注信息'}
                                    value={this.state.remark}
                                    onChangeText={(value) => this.setState({remark: value})}
                                />
                            </View>
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text style={{fontSize: 14, color: Colors.C12}}>数量</Text>
                            <View style={{flexDirection: 'row', height: 50, borderBottomColor: Colors.C13, borderBottomWidth: 1, }}>
                                <TextInput
                                    style={{flex: 1}}
                                    placeholder={`最低提币${data.minCanMove}`}
                                    value={this.state.coinAmount}
                                    keyboardType={'number-pad'}
                                    onChangeText={this.setAmount}
                                />
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{fontSize: 13, color: Colors.C10}}>{data.name} | </Text>
                                    <Pressable onPress={() => this.setState({coinAmount: `${data.balance}`})}>
                                        <Text>全部</Text>
                                    </Pressable>
                                </View>
                            </View>
                            <Text style={{fontSize: 10, color: C10, marginTop: 5}}>{`可用 ${data.balance} ${data.name}`}</Text>
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text style={{fontSize: 14, color: Colors.C12}}>手续费</Text>
                            <View style={{flexDirection: 'row', height: 40, borderBottomColor: Colors.C13, borderBottomWidth: 1, alignItems: 'center' }}>
                                <Text style={{flex: 1, fontSize: 14, color: Colors.C12}}>{data.fee}</Text>
                                <Text style={{fontSize: 14, color: Colors.C12}}>{data.name}</Text>
                            </View>
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text style={{fontSize: 14, color: Colors.C12}}>验证码</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', height: 50, borderBottomColor: Colors.C13, borderBottomWidth: 1, }}>
                                <TextInput
                                    style={{flex: 1}}
                                    placeholder={'请输入验证码'}
                                    keyboardType={'number-pad'}
                                    value={this.state.verifyCode}
                                    onChangeText={(value) => this.setState({verifyCode: value})}
                                />
                                <CountDownButton
                                    textStyle={{fontSize: 14, fontWeight: '600', color: '#034694' }}
                                    style={{backgroundColor: Colors.White, width: 90}}
                                    buttonStyle={{ fontSize: 16 }}
                                    timerCount={60}
                                    timerTitle={'获取验证码'}
                                    enable={true}
                                    onClick={(shouldStartCountting) =>  this.getCode(shouldStartCountting) }
                                    timerEnd={() => this.setState({ state: '倒计时结束' }) } />
                            </View>
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text style={{fontSize: 14, color: Colors.C12}}>交易密码</Text>
                            <View style={{height: 50, borderBottomColor: Colors.C13, borderBottomWidth: 1, }}>
                                <TextInput
                                    style={{flex: 1}}
                                    placeholder={'请输入交易密码'}
                                    secureTextEntry={true}
                                    value={this.state.password}
                                    onChangeText={(value) => this.setState({password: value})}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
                <View style={{padding: 15}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text>到账数量</Text>
                        <Text>{`${daozhang > 0 ? daozhang : 0} ${data.name}`}</Text>
                    </View>
                    <TouchableOpacity style={styles.bigbtn} onPress={this.post}>
                        <Text style={{fontSize: 16, color: Colors.White}}>提交</Text>
                    </TouchableOpacity>
                </View>
                {this.state.isLoading && <Loading/>}
            </View>
        );
    }
}

const mapStateToProps = state => ({
    mobile: state.user.mobile,
});
const mapDispatchToProps = dispatch => ({
	// logout: () => dispatch({ type: LOGOUT }),
	// updateUserInfo: (userInfo) => dispatch({ type: UPDATE_USER, payload: { userInfo } })
});
export default connect(mapStateToProps, mapDispatchToProps)(WithdrawMoney);

const styles = StyleSheet.create({
    bigbtn: {
        height: 40, 
        marginTop: 10, 
        backgroundColor: Colors.main, 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 20
    },
})
