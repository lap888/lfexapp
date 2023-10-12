import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform, NativeModules, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import { SET_USERINFO } from '../../../redux/ActionTypes';
import { Colors, Metrics } from '../../theme/Index';
import { Header } from '../../components/Index';
import { EncryptionIdCode } from '../../../utils/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

// const ZIMFacade = NativeModules.ZIMFacade;
const RNAlipayVerify = NativeModules.RNAlipayVerify;
// 实名认证
const AUTHENTICATION_STATUS = [
    { key: 0, value: "未实名认证", title: "未实名认证" },
    { key: 1, value: "提交人工审核", title: "提交人工审核" },
    { key: 2, value: "审核通过", title: "审核通过" },
    { key: 3, value: "审核未通过", title: "再次提交" },
];
class Certification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            certifyId: "",
            username: "", 		// 用户真实姓名
            alipay: "",			// 支付宝
            idCard: "",			// 身份证
            alipayTemp: ""		// 再次输入支付宝
        };
    }
    onRightPress() {
        Actions.push('CertificationManual', { auditState: this.props.auditState });
    }
    getSubmmitButtonText(auditState) {
        let element = AUTHENTICATION_STATUS.filter(item => auditState === item['key']);
        return element[0]['value'];
    }
    /**
	 * 更新用户信息
	 */
    updateUserInfo(golds, level, candyP) {
        if (!this.props.userId) return;
        var that = this;
        setTimeout(() => {
            let userInfoServer = { auditState: 2, golds, level, candyP };
            that.props.resetUserInfo(userInfoServer);
        }, 1000);
    }
    /**
	 * 提交
	 */
    verification() {
        /* 发送请求 */
        let params = {
            trueName: this.state.username,
            idNum: this.state.idCard,
            alipay: this.state.alipay,
            certifyId: this.state.certifyId,
            AuthType: 0
        }
        let that = this;
        if (that.props.logged) {
            Send("api/Authentication", params).then(res => {
                if (res.code == 200) {
                    Toast.show({
                        text: "认证成功",
                        textStyle: { color: '#FFFFFF', textAlign: 'center' },
                        position: "success",
                        duration: 2000
                    });
                    that.updateUserInfo(res.data.golds, res.data.level, res.data.candyP);
                } else {
                    Toast.show({
                        text: res.message,
                        position: "top",
                        textStyle: { textAlign: "center" },
                    })
                }
            });
        } else {
            Toast.show({
                text: "请先登录",
                position: "top",
                textStyle: { textAlign: "center" },
            })
            setTimeout(() => Actions.push('Login'), 1000);
        }
    }
    /**
	 * 调用刷脸SDK，返回身份验证情况
     * @param {*} url
	 * @param {*} certifyId 
	 */
    verify(url, certifyId) {

        if (Platform.OS == "ios") {
            RNAlipayVerify.startVerifyService(url, certifyId, (response) => {
                if (response) {
                    // 处理业务逻辑 提交后台
                    this.verification();
                } else {
                    Toast.show({
                        text: "认证失败",
                        textStyle: { color: '#FFFFFF', textAlign: 'center' },
                        position: "top",
                        duration: 2000
                    });
                }
            })
        } else {
            // ZIMFacade.verify(url, certifyId, (response) => {
            //     if (response) {
            //         // 处理业务逻辑 提交后台
            //         this.verification();
            //     } else {
            //         Toast.show({
            //             text: "认证失败",
            //             textStyle: { color: '#FFFFFF', textAlign: 'center' },
            //             position: "top",
            //             duration: 2000
            //         });
            //     }
            // });
        }
    }
    payRefund() {
        Send('api/PayRefund', {}, 'get').then(res => {
            Toast.show({
                text: res.message,
                position: "top",
                textStyle: { textAlign: "center" },
            });
        });
    }
    /**
     * 调用自己后台服务器接口 获取认证需要参数
     */
    getZimid(certName, certNo) {
        Keyboard.dismiss();
        let username = this.state.username
        let alipay = this.state.alipay
        let idCard = this.state.idCard
        let that = this;
        if (username.length === 0 || alipay.length === 0 || idCard.length === 0) {
            Toast.show({
                text: "所有选项都为必填",
                position: "top",
                textStyle: { textAlign: "center" }
            })
            return;
        }
        if (this.state.alipay !== this.state.alipayTemp) {
            Toast.show({
                text: "两次输入的支付宝账户不一致",
                position: "top",
                textStyle: { textAlign: "center" }
            })
            return;
        }
        Send("apiV2/FaceInit", { certName: certName, certNo: certNo, alipay: this.state.alipay }).then(response => {
            if (response.code == 200) {
                // certifyId
                that.setState({
                    certifyId: response.data.certifyId
                })
                // 调用刷脸SDK
                this.verify(response.data.certifyUrl, response.data.certifyId);
            } else {
                Toast.show({
                    text: response.message,
                    textStyle: { color: '#FFFFFF', textAlign: 'center' },
                    position: "top",
                    duration: 2000
                });
            }
        });

        // ZIMFacade.getZimFace(certName, certNo,
        //     (response) => {
        //         let responseJson = JSON.parse(response);
        //         if (responseJson.code == 200) {
        //             // certifyId
        //             that.setState({
        //                 certifyId: responseJson.data.certifyId
        //             })
        //             // 调用刷脸SDK
        //             this.verify(responseJson.data.certifyUrl, responseJson.data.certifyId);
        //         } else {
        //             console.log('===err===', response.message);
        //             Toast.show({
        //                 text: res.message,
        //                 textStyle: { color: '#FFFFFF', textAlign: 'center' },
        //                 position: "top",
        //                 duration: 2000
        //             });
        //         }
        //     },
        //     (error) => {
        //         console.log(error);
        //     }
        // );
    }
    onIsTouchPress() {
        this.getZimid(this.state.username, this.state.idCard);
    }
    isTouch() {
        if (this.props.auditState !== 2) {
            return (
                <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => this.onIsTouchPress()}>
                        <View style={[Styles.submitBtn, { backgroundColor: Colors.mainTab }]}>
                            <Text style={Styles.submitTxt}>
                                提交人脸审核
							</Text>
                        </View>
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={() => this.payRefund()}>
                        <View style={[Styles.submitBtn, { backgroundColor: Colors.C16, marginTop: 20 }]}>
                            <Text style={Styles.submitTxt}>
                                申请退款
					        </Text>
                        </View>
                    </TouchableOpacity> */}
                </View>
            )
        } else {
            return (
                <View style={[Styles.submitBtn, { backgroundColor: Colors.mainTab, flexDirection: "row" }]}>
                    <Text style={Styles.submitTxt}>
                        审核已通过
					</Text>
                    <Icon name="check-circle" type='FontAwesome' style={{ fontSize: 18, color: '#ffffff' }} />
                </View>
            )
        }
    }
    render() {
        return (
            <View style={Styles.container}>
                <Header title="实名认证" rightText="人工审核" rightStyle={{ fontSize: 12 }} onRightPress={() => { this.onRightPress() }} />
                <LinearGradient colors={[Colors.mainTab, Colors.LightG]} start={{ x: 0, y: 0.1 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
                    <ScrollView style={{ margin: 5 }}>
                        <View style={{ padding: 8, backgroundColor: "#ffffff" }}>
                            <Text style={{ color: Colors.mainTab, fontSize: 14, }}>
                                {'认证状态:' + this.getSubmmitButtonText(this.props.auditState)}
                            </Text>
                        </View>
                        <View style={Styles.itemView}>
                            <Text style={{ color: "#2c2c2c" }}>姓名</Text>
                            <TextInput style={Styles.inputStyle}
                                editable={this.props.auditState !== 2}
                                placeholder="请填写姓名"
                                autoCapitalize="none"
                                defaultValue={this.props.auditState === 2 ? this.props.trueName : ""}
                                clearButtonMode="while-editing"
                                onChangeText={(text) => {
                                    this.setState({
                                        username: text
                                    });
                                }}
                                returnKeyType="next"
                            />
                        </View>
                        <View style={Styles.itemView}>
                            <Text style={{ color: "#2c2c2c" }}>身份证</Text>
                            <TextInput style={Styles.inputStyle}
                                editable={this.props.auditState !== 2}
                                placeholder="请填写身份证号"
                                defaultValue={this.props.auditState === 2 ? EncryptionIdCode(this.props.idNum) : ""}
                                autoCapitalize="none"
                                clearButtonMode="while-editing"
                                onChangeText={(text) => {
                                    this.setState({
                                        idCard: text
                                    });
                                }}
                                returnKeyType="next"
                            />
                        </View>
                        <View style={Styles.itemView}>
                            <Text style={{ color: "#2c2c2c" }}>支付宝</Text>
                            <TextInput style={Styles.inputStyle}
                                editable={this.props.auditState !== 2}
                                placeholder="请填写支付宝"
                                autoCapitalize="none"
                                defaultValue={this.props.auditState === 2 ? this.props.alipay : ""}
                                clearButtonMode="while-editing"
                                onChangeText={(text) => {
                                    this.setState({
                                        alipay: text
                                    });
                                }}
                                returnKeyType="next"
                            />
                        </View>
                        {this.props.auditState !== 2 &&
                            <View style={Styles.itemView}>
                                <Text style={{ color: "#2c2c2c" }}>确认支付宝</Text>
                                <TextInput style={Styles.inputStyle}
                                    placeholder="请再次填写支付宝"
                                    autoCapitalize="none"
                                    defaultValue={this.state.alipayTemp}
                                    clearButtonMode="while-editing"
                                    onChangeText={(text) => {
                                        this.setState({
                                            alipayTemp: text
                                        });
                                    }}
                                    returnKeyType="done"
                                    onSubmitEditing={() => this.getZimid(this.state.username, this.state.idCard)}
                                />
                            </View>
                        }
                        <View style={Styles.submitView}>
                            {this.isTouch()}
                        </View>
                    </ScrollView>
                </LinearGradient>
            </View>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id,
    auditState: state.user.auditState,
    alipay: state.user.alipay,
    idNum: state.user.idNum,
    trueName: state.user.trueName
});

const mapDispatchToProps = dispatch => ({
    resetUserInfo: userInfo => dispatch({ type: SET_USERINFO, payload: { userInfo } }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Certification);
const Styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    itemView: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.LightG,
        paddingHorizontal: 10,
        height: 48,
        borderRadius: 6,
        marginVertical: 1,
    },
    inputStyle: {
        flex: 1, textAlign: 'right'
    },
    submitView: {
        alignItems: "center",
        marginTop: Metrics.screenHeight * 0.1,
    },
    submitBtn: {
        width: Metrics.screenWidth * 0.4,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    submitTxt: {
        padding: 15,
        color: "#ffffff"
    },
})