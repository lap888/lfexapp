import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, Image } from 'react-native';
import ImagePicker from 'react-native-image-picker';
// const AliPay = NativeModules.AliPayModule;
import { Actions } from 'react-native-router-flux';
import { Header } from '../../../components/Index';
import { connect } from 'react-redux';
import { LOGOUT } from '../../../../redux/ActionTypes';
import { Colors, Metrics } from '../../../theme/Index';
import { SetAlipay } from '../../../../redux/ActionTypes';
import { Send } from '../../../../utils/Http';
import { Toast } from '../../../common';
import Icon from 'react-native-vector-icons/Ionicons';

class ModifyAlipay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alipay: "",
            enterAlipay: '',
            pwd: '',
            payImg: this.props.alipayPic,
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

        let {alipay, enterAlipay, pwd, payImg} = this.state;
        /* 非空校验 */
        if (alipay.length === 0) {
            Toast.tipTop('支付宝为必填项')
            return;
        }
        if (pwd.length === 0) {
            Toast.tipTop('支付密码为必填项')
            return;
        }
        if (alipay !== enterAlipay) {
            Toast.tipTop('两次支付账号不一致')
            return;
        }
        Send(`api/UserAli/Change`, { alipay: alipay, PayPwd: pwd, AlipayPic: payImg })
        .then(res => {
            if (res.code == 200) {
                Toast.tipTop('修改成功')
                this.props.modifyAlipay(alipay);
                Actions.pop();
            } else {
                Toast.tipTop(res.message)
            }
        })
    }

    /**
     * 调起相册
     */
    handleImagePicker = () => {
        const options = {
            title: '上传图片',
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: Platform.OS === 'ios' ? '拍照' : null,
            chooseFromLibraryButtonTitle: '图库',
            cameraType: 'back',
            mediaType: 'photo',
            videoQuality: 'high',
            quality: 1,
            angle: 0,
            allowsEditing: false,
            noData: false,
        };
        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                console.log('用户取消了选择图片');
            } else if (response.error) {
                console.log('ImagePicker 错误: ', response.error);
            } else {
                this.setState({ payImg: 'data:image/jpeg;base64,' + response.data });
            }
        });
    }

    render() {
        return (
            <View style={styles.businessPwdPageView}>
                <Header title="修改支付宝" />
                <View style={{ flex: 1 }}>
                    <View style={styles.pwdViewStyle}>
                        {/* <View style={{ paddingVertical: 5 }}>
                            <Text style={{ color: Colors.mainTab, fontSize: 14, }}> 提示: 修改支付宝需要支付50+100果皮服务费用 </Text>
                        </View> */}
                        <TextInput 
                            style={styles.inputViewStyle}
                            placeholder="请输入新支付宝"
                            autoCapitalize="none"
                            clearButtonMode="always"
                            keyboardType='number-pad'
                            onChangeText={(text) => {
                                this.setState({
                                    alipay: text
                                })
                            }}
                        />
                        <TextInput 
                            style={styles.inputViewStyle}
                            placeholder="请确认支付宝"
                            autoCapitalize="none"
                            clearButtonMode="always"
                            keyboardType='number-pad'
                            onChangeText={(text) => {
                                this.setState({
                                    enterAlipay: text
                                })
                            }}
                        />
                        <TextInput
                            style={styles.inputViewStyle}
                            placeholder="请输入支付密码"
                            autoCapitalize="none"
                            clearButtonMode="always"
                            secureTextEntry={true} 
                            onChangeText={(text) => this.setState({ pwd: text }) }
                        />
                        <View style={{marginTop: 10}}>
                            <Text style={{marginBottom: 10, fontSize: 14, color: Colors.greyText}}>支付宝收款码</Text>
                            <TouchableOpacity style={styles.selectImgBtn} onPress={this.handleImagePicker}>
                                {this.state.payImg == ''  ?
                                    <Icon name={'ios-add'} size={50} color={Colors.grayFont} /> :
                                    <Image style={styles.selectImgBtn} resizeMode='stretch' source={{ uri: this.state.payImg }} />
                                }
                            </TouchableOpacity>
                        </View>
                        <View style={styles.submitView}>
                            <TouchableOpacity onPress={() => this.resetTradePed() }>
                                <View style={styles.submitBtn} >
                                    <Text style={{ padding: 15, color: "#ffffff" }}> 确认 </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    userId: state.user.id,
    alipayPic: state.user.alipayPic,
});

const mapDispatchToProps = dispatch => ({
    modifyAlipay: (alipay) => dispatch({ type: SetAlipay, payload: { alipay: alipay } }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModifyAlipay);

// 样式
const styles = StyleSheet.create({
    businessPwdPageView: {
        flex: 1,
        backgroundColor: Colors.White,
    },
    pwdViewStyle: {
        padding: 10,
        paddingHorizontal: 15
    },
    inputViewStyle: {
        height: 48,
        paddingLeft: 10,
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: Colors.backgroundColor,
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
    selectImgBtn: {
        width: 100,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.backgroundColor,
        borderRadius: 5
    },
})