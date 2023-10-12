import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, ScrollView } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
// import { Icon } from 'native-base';
import { LOGOUT, UPDATE_USER_AVATAR } from '../../../../redux/ActionTypes';
import ImagePicker from 'react-native-image-picker';
import { Header } from '../../../components/Index';
import { API_PATH, Version } from '../../../../config/Index';
import Cookie from 'cross-cookie';
import { Colors, Metrics } from '../../../theme/Index';
import { Send } from '../../../../utils/Http';
import Advert from '../../advert/Advert';
import Icon from 'react-native-vector-icons/Ionicons';
import Env from '../../../../config/Env';

class UserInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.navigation.state.params.name || ''
        };
    }
    /**
     * 调用摄像头或手机相册
     */
    pickImage() {
        var that = this;
        const options = {
            title: '上传图片',
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: Platform.OS === 'ios' ? '拍照' : null,
            chooseFromLibraryButtonTitle: '图库',
            cameraType: 'back',
            mediaType: 'photo',
            videoQuality: 'high',
            durationLimit: 10,
            maxWidth: 600,
            maxHeight: 600,
            aspectX: 2,
            aspectY: 1,
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
                let picBase = 'data:image/jpeg;base64,' + response.data;
                Send('api/ModifyUserPic', { userPic: picBase }).then(res => {
                    if (res.code == 200) {
                        that.props.updateUserAvatar(res.data);
                    }
                })
            }
        });
    }
    /**
	 * 退出登录
	 */
    loginOut() {
        Cookie.remove('token')
        this.props.logout();
        Advert.setUserId()
        Actions.pop();
    }
    render() {
        let { mobile, name, alipay, rcode, level, avatarUrl, inviterMobile, reContactTel, reWeChatNo, myContactTel, myWeChatNo } = this.props;
        return (
            <View style={styles.container}>
                <Header title="基本资料"  rightStyle={{fontSize: 12}} rightText={`${Env === 'dev' ? 'de' : ''}v ${Version}`}/>
                <ScrollView>
                    <View style={styles.labelContainer}>
                        <Text style={styles.lableTxt}>账号</Text>
                        <Text style={[styles.lableTxt, { color: Colors.greyText }]}>{mobile}</Text>
                    </View>
                    <View style={styles.labelContainer}>
                        <Text style={styles.lableTxt}>等级</Text>
                        <TouchableOpacity style={styles.btnRight} onPress={() => Actions.push('Level')}>
                            <Text style={[styles.lableTxt, { color: Colors.mainTab }]}>{level}</Text>
                            <Icon name="ios-chevron-forward" size={20} color={Colors.mainTab} style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.labelContainer}>
                        <Text style={styles.lableTxt}>昵称</Text>
                        <TouchableOpacity onPress={() => Actions.EditUserInfo()}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: "center" }}>
                                <Text style={[styles.lableTxt, styles.nickname]} numberOfLines={1}>{name}</Text>
                                <Icon name="ios-chevron-forward" size={20} color={Colors.mainTab}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.labelContainer}>
                        <Text style={styles.lableTxt}>用户头像</Text>
                        <TouchableOpacity onPress={() => this.pickImage()}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Image source={{ uri: avatarUrl }} style={{ width: 38, height: 38, borderRadius: 19 }} />
                                <Icon name="ios-chevron-forward"  size={20} color={Colors.mainTab}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.labelContainer}>
                        <Text style={styles.lableTxt}>修改邀请码</Text>
                        <TouchableOpacity style={styles.btnRight} onPress={() => Actions.push('EditInviterCode')}>
                            <Text style={[styles.lableTxt, { color: Colors.greyText }]}>{rcode == "0" ? "申请邀请码" : `邀请码:${rcode}`}</Text>
                            <Icon name="ios-chevron-forward" size={20} color={Colors.mainTab} style={{ marginLeft: 5 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.labelContainer}>
                        <Text style={styles.lableTxt}>邀请人</Text>
                        <TouchableOpacity style={styles.btnRight} onPress={() => Actions.push('SuperiorInfo',{ reContactTel, reWeChatNo })}>
                            <Text style={[styles.lableTxt, { color: Colors.greyText }]}>{inviterMobile}</Text>
                            <Icon name="ios-chevron-forward" size={20} color={Colors.mainTab} style={{ marginLeft: 5 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.labelContainer}>
                        <Text style={styles.lableTxt}>修改联系方式</Text>
                        <TouchableOpacity style={styles.btnRight} onPress={() => Actions.push('SetContact',{ myContactTel, myWeChatNo })}>
                            <Text style={[styles.lableTxt, { color: Colors.greyText }]}></Text>
                            <Icon name="ios-chevron-forward" size={20} color={Colors.mainTab} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.labelContainer} onPress={() => Actions.BusinessPwd()}>
                        <Text style={styles.lableTxt}>修改交易密码</Text>
                        <View style={styles.btnRight}>
                            <Icon name="ios-chevron-forward" size={20} color={Colors.mainTab}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.labelContainer} onPress={() => Actions.EditSignInPwd()}>
                        <Text style={styles.lableTxt}>修改登录密码</Text>
                        <View style={styles.btnRight}>
                            <Icon name="ios-chevron-forward" size={20} color={Colors.mainTab}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.labelContainer} onPress={() => Actions.push('ModifyAlipay')}>
                        <Text style={styles.lableTxt}>修改支付宝</Text>
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: "center" }}>
                            <Text style={[styles.lableTxt, styles.nickname]} numberOfLines={1}>{alipay}</Text>
                            <Icon name="ios-chevron-forward" size={20} color={Colors.mainTab}/>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.signOutView}>
                        <TouchableOpacity style={styles.signOutBtn} onPress={() => { this.loginOut() }}>
                            <Text style={{ color: "#ffffff" }}>退出登录</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id,
    mobile: state.user.mobile,
    name: state.user.name,
    alipay: state.user.alipay,
    level: state.user.level,
    rcode: state.user.rcode,
    avatarUrl: state.user.avatarUrl,
    inviterMobile: state.user.inviterMobile,
    reWeChatNo: state.user.reWeChatNo,
    reContactTel: state.user.reContactTel,
    myWeChatNo: state.user.myWeChatNo,
    myContactTel: state.user.myContactTel,
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch({ type: LOGOUT }),
    updateUserAvatar: avatar => dispatch({ type: UPDATE_USER_AVATAR, payload: { avatar } })
});

export default connect(mapStateToProps, mapDispatchToProps)(UserInfo);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    button: { margin: 100, backgroundColor: 'orange' },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 45,
        marginLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.C7
    },
    labelContainerflex: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.C7
    },
    lableTxt: { 
        fontSize: 15, 
        color: Colors.blakText 
    },
    nickname: {
        textAlign: "right",
        paddingRight: 10, 
        color: Colors.greyText
    },
    signOutView: {
        justifyContent: 'center',
        alignItems: "center",
        marginBottom: 40,
        marginTop: 50,
    },
    signOutBtn: {
        width: Metrics.screenWidth - 60,
        backgroundColor: Colors.mainTab,
        height: 40,
        alignItems: "center",
        justifyContent: 'center',
        borderRadius: 20,
    },
    btnRight: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: "center"
    },
})