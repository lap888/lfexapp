import React, { Component } from 'react';
import { StyleSheet, Alert, View, Platform, Text, Image, TouchableOpacity, ImageBackground, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Header } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

export default class InvitationCode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            invitationCode: ''
        };
    }
    confirmCode = () => {
        if (this.state.invitationCode === '') {
            Toast.tipTop('邀请码不能为空')
            return false;
        }
        Send('api/GetNameByMobile?mobile=' + this.state.invitationCode, {}, 'GET').then(res => {
            if (res.code == 200) {
                Alert.alert(
                    "邀请人确认",
                    `该码属于:${res.data}`,
                    [
                        { text: "确定", onPress: () => Actions.push('SignUp', { invitationCode: this.state.invitationCode }) },
                        { text: "取消", onPress: () => { } },
                    ],
                    { onDismiss: () => { } }
                )
            } else {
                Toast.tipTop(res.message)
            }
        })
    }
    render() {
        return (
            <KeyboardAvoidingView style={{flex:1}}  behavior={Platform.OS==='ios'?'padding':''} enabled={Platform.OS!=='android'}>
            <ScrollView behavior={Platform.OS == "ios" ? "padding" : "height"} style={{flex: 1}}  showsVerticalScrollIndicator={false}>
                <ImageBackground style={{width: Metrics.screenWidth, height: Metrics.screenHeight}} resizeMode={'stretch'} source={require('../../images/login/register_code.png')}>
                    <Header title="邀请码" leftIconColor={'#000'} titleStyle={{color: Colors.blakText, fontWeight: '700' }} backgroundColor={Colors.transparent} />
                    <View style={{height: Metrics.screenHeight/4*3}}/>
                    <View style={{ height: 50, paddingHorizontal: 20, backgroundColor: Colors.main, marginHorizontal: 30, borderRadius: 25 }}>
                        <TextInput 
                            value={this.state.mobile} 
                            style={{ flex: 1, fontSize: 15, textAlign: 'center', color: Colors.White }} 
                            placeholder="请 输 入 邀 请 码" 
                            placeholderTextColor={Colors.White} 
                            onChangeText={(value) => this.setState({ invitationCode: value })} 
                            />
                    </View>
                    <TouchableOpacity style={styles.submitBtn} onPress={this.confirmCode} >
                        <Text style={{ padding: 15, color: '#36476E', fontWeight: '700' }}>下一步</Text>
                        <Image source={require('../../images/login/next.png')} />
                    </TouchableOpacity>
                </ImageBackground>
            </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}
const styles = StyleSheet.create({
    submitView: {
        
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 30,
        paddingBottom: 30,
    }
});
