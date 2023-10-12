import React, { Component } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image, TextInput, Keyboard, Pressable } from 'react-native';
import Cookie from 'cross-cookie';
import DeviceInfo from 'react-native-device-info';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import { LOGIN_SUCCESS } from '../../../redux/ActionTypes';
import { Metrics, Colors } from '../../theme/Index';
import { Header } from '../../components/Index';
import { ParamsValidate } from '../../../utils/Index';
import { Send } from '../../../utils/Http';
import Advert from '../advert/Advert';
import { Toast } from '../../common';

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mobile: props.mobile || '',
			password: '',
			displayMobile: "none",
			displayPassword: "none",
		};
	}
	_onChangeMobile = (inputData) => {
		this.setState({ displayMobile: "flex", mobile: inputData });
	}

	_onChangePassword = (inputData) => {
		this.setState({ displayPassword: "flex", password: inputData });
	}
	Login = async () => {
		Keyboard.dismiss();
		var that = this;
		let mobile = this.state.mobile;
		let mobileMsg = ParamsValidate('mobile', mobile);
		if (mobileMsg !== null) {
			Toast.tipTop(mobileMsg)
			return;
		}
		let password = this.state.password;
		let passwordMsg = ParamsValidate('password', password);
		if (passwordMsg !== null) {
			Toast.tipTop(passwordMsg)
			return;
		}

		let deviceName = ''
		await DeviceInfo.getDeviceName()
			.then((name) => {
				deviceName = name;
			}).catch((err) => console.log('err', err));
		let params = {};
		params = this.state;
		params.version = DeviceInfo.getVersion();
		params.uniqueID = DeviceInfo.getUniqueId();
		params.systemName = DeviceInfo.getSystemName();
		params.systemVersion = DeviceInfo.getSystemVersion();
		params.deviceName = deviceName;
		params.lat = 0;
		params.lng = 0;
		params.province = typeof this.props.location.province == 'object' ? '' : this.props.location.province;
		params.provinceCode = 0;
		params.city = this.props.location.city == 'object' ? '' : this.props.location.city;
		params.cityCode = this.props.location.cityCode == 'object' ? 0 : this.props.location.cityCode;
		params.area = this.props.location.district == 'object' ? '' : this.props.location.district;
		params.areaCode = this.props.location.adCode == 'object' ? 0 : this.props.location.adCode;
		// console.log('params: ', params);

		Send("api/login", params).then(res => {
			// 后端返回结果,获得用户信息,存id到cookie里
			if (res.code == 200) {
				that.props.loginSuccess(res.data.user);
				Cookie.set({ 'token': res.data.token });
				Cookie.set({ 'userId': res.data.user.id });
				Advert.setUserId(`s9${res.data.user.id}`)
				setTimeout(function () {
					Actions.replace("Index");
				}, 0);
			} else {
				Toast.tipTop(res.message)
			}
		})
	}

	displayBack = () => {
		if (this.props.relogin === "resetPwd") {
			return (
				<Header title="登录" rightText="注册" leftIcon="" onRightPress={() => Actions.InvitationCode()} />
			)
		} else {
			return (
				<Header title="登录" rightText="注册" onRightPress={() => Actions.InvitationCode()} />
			)
		}
	}

	render() {
		return (
			<View style={{flex: 1}}>
				<View style={{alignItems: 'flex-end', marginTop: 20, marginRight: 20}}>
					<Pressable onPress={() => Actions.pop()}>
						<Image source={require('../../images/login/close.png')}/>
					</Pressable>
				</View>
				<View style={{justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
					<Text style={{fontSize: 22, color: Colors.blakText, fontWeight: '700'}}>用户账号登录</Text>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 50, marginTop: 30}}>
					<Image source={require('../../images/login/zhanghao.png')} />
					<View style={{height: 50, flex: 1, marginLeft: 10, borderBottomWidth: 1, borderBottomColor: Colors.backgroundColor}}>
						<TextInput 
							value={this.state.mobile}
							style={styles.placeholderText}
							placeholder="请输入注册的手机号"
							keyboardType={'number-pad'}
							onChangeText={this._onChangeMobile}
							clearButtonMode="while-editing" />
					</View>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 50, marginTop: 30}}>
					<Image source={require('../../images/login/password.png')} />
					<View style={{height: 50, flex: 1, marginLeft: 10, borderBottomWidth: 1, borderBottomColor: Colors.backgroundColor}}>
						<TextInput 
							value={this.state.password}
							style={styles.placeholderText}
							secureTextEntry={true}
							placeholder="请输入您的密码"
							onChangeText={this._onChangePassword}
							clearButtonMode="while-editing"
							returnKeyType="done"
							onSubmitEditing={() => this.Login()}/>
					</View>
				</View>
				<View style={{ alignItems: 'flex-end', paddingHorizontal: 50, marginTop: 15}}>
					<Text style={{fontSize: 12, color: Colors.greyText}} onPress={() => Actions.Password()}>忘记密码？</Text>
				</View>
				<TouchableOpacity style={{ height: 40, paddingHorizontal: 50, marginTop: 30, borderRadius: 20}} onPress={this.Login}>
					<LinearGradient colors={['#3496F7', '#0064B5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: 20}}>
						<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
							<Text style={{fontSize: 15, color: Colors.White, }}>登 录</Text>
						</View>
					</LinearGradient>
				</TouchableOpacity>
				<View style={{flex: 1}}/>
				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30}}>
					<Text style={{fontSize: 14, color: Colors.greyText}}>没有账号？</Text>
					<Text style={{fontSize: 14, color: Colors.main,}} onPress={() => Actions.InvitationCode()}>点击注册</Text>
				</View>
			</View>
		);
	}
}
const mapStateToProps = state => ({
	location: state.user.location
});

const mapDispatchToProps = dispatch => ({
	loginSuccess: userInfo => dispatch({ type: LOGIN_SUCCESS, payload: { userInfo } }),
});
export default connect(mapStateToProps, mapDispatchToProps)(Login);

const styles = StyleSheet.create({
	signInView: {
		height: Metrics.screenWidth * 0.5,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: "center",
	},
	signInBtn: {
		backgroundColor: Colors.mainTab,
		width: Metrics.screenWidth * 0.6,
		alignItems: "center",
		borderRadius: 8,
	},
	resetPwd: {
		width: Metrics.screenWidth * 0.3,
		alignItems: 'center',
	},
	placeholderText: {
		height: 50,
		fontSize: 16,
		flex: 1,
	},
	text: {
		fontSize: 16,
		color: '#ffffff',
	},
	imagestyle: {
		width: 80,
		height: 80,
		borderRadius: 5,
	},
	clearIcon: {
		width: 20,
		height: 20
	},
})