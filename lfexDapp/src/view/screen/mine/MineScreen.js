import React, { Component } from 'react';
import { View, Text, NativeModules, StyleSheet, ScrollView, TouchableWithoutFeedback, Linking, Image, Platform, TouchableOpacity, StatusBar, Pressable } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
// import { Toast } from 'native-base';
import Toast from '../../common/Toast';
import Cookie from 'cross-cookie';
import { Colors, Metrics } from '../../theme/Index';
import { LOGOUT, UPDATE_USER } from '../../../redux/ActionTypes';
import { AUTH_SECRET, API_PATH, Env, Version } from '../../../config/Index';
import MathFloat from '../../../utils/MathFloat';
import { PROFILE_BAR } from '../../../config/Constants';
import { Send } from '../../../utils/Http';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScrollTopBar } from '../../components/Index';
import LegalCoin from './LegalCoin';
import Currency from './Currency';
import { Coin } from '../../../api';

const FeiMa = NativeModules.FeiMaModule;

class MineScreen extends Component {

	constructor(props) {
		super(props);
		this.state = {
			eyes: true
		};
	}

	componentDidMount() {
		// this.getCoinAmount(0)
	}

	/**
		 * 渲染用户收益
		 */
	renderProfile() {
		return (
		<View style={Styles.profile}>
			{PROFILE_BAR.map(item => {
			let { key, title, router } = item;
			let value = (this.props[key] == 'undefined' || this.props[key] == null) ? 0 : this.props[key];
			if (key === 'candyH') {
				value = value.toFixed(2);
			} else if (key === 'candyP' || key === 'candyNum') {
				value = value.toFixed(2);//
			} else if (key === 'balance') {
				value = MathFloat.floor(this.props.userBalanceNormal, 2) + MathFloat.floor(this.props.userBalanceLock, 2);
				value = value.toFixed(2);
			} else {
				value = '¥' + MathFloat.floor(value, 2);
			}
			return (
				<TouchableWithoutFeedback key={key} onPress={() => {
				Actions.push(this.props.logged ? router : 'Login')
				}}>
				<View style={Styles.profileItem}>
					<Text style={[Styles.profileText]}>{value}</Text>
					<Text style={Styles.profileTitle}>{title}</Text>
				</View>
				</TouchableWithoutFeedback>
			)
			})}
		</View>
		)
	}
	/**
	 * 渲染变色版
	 */
	renderGradient() {
		let { avatar, nickname, rcode } = this.props;
		return (
		<LinearGradient colors={[Colors.mainTab, Colors.LightG]} start={{ x: 0, y: 0.1 }} end={{ x: 0, y: 1 }} style={Styles.gradient}>
		</LinearGradient>
		)
	}
	onClickLevelBar() {
		if (this.props.logged) {
		Send(`api/system/CopyWriting?type=userlevel`, {}, 'get').then(res => {
			Actions.push('CommonRules', { title: '会员等级', rules: res.data });
		});
		} else {
		Actions.push('Login');
		}
	}
	/**
		 * 渲染用户等级Bar
		 */
	renderLevelBar() {
		let { golds, level } = this.props;
		let LEVEL_CLASS = ["LV0", "LV1", "LV2", "LV3", "LV4", "LV5", "LV6", "LV7", "LV8", "LV9"];
		return (
		<TouchableWithoutFeedback onPress={() => this.onClickLevelBar()}>
		
		</TouchableWithoutFeedback>
		)
	}
	/**
		 * 交易Bar 点击事件
		 */
	handleTransactionBar(item) {
		if (this.props.logged) {
		if (item.hasOwnProperty('businessType')) {
			Actions.push('BusinessPage', { businessType: item['businessType'] });
		} else {
			Actions.push(item['router']);
		}
		} else {
		Actions.push('Login');
		}
	}
	/**
		 * 渲染交易Bar
		 */
	renderTransaction() {
		return (
		<View style={Styles.barContainer}>
		
		</View>
		)
	}
	/**
		 * 渲染基本信息
		 */
	renderBasicInfo() {
		return (
		<View style={Styles.barContainer}>
			
		</View>
		)
	}
	/**
		 * 联系QQ客服
		 */
	onClickQQ() {
		Send(`api/system/CopyWriting?type=call_me`, {}, 'get').then(res => {
		Actions.push('CommonRules', { title: '联系我们', rules: res.data });
		});
	}
	/**
		 * 服务Bar 点击事件
		 */
	handleServiceBar(item) {
		if (this.props.logged) {
		if (item.hasOwnProperty('router')) {
			if (item['router'] === 'CommonRules') {
			this.onServicePress()
			} else if (item['router'] === 'qq') {
			this.onClickQQ();
			} else {
			Actions.push(item['router']);
			}
		} else {
			if (item['key'] === '0') this.onClickQQ();
		}
		} else {
		Actions.push('Login');
		}
	}
	onServicePress() {
		Send(`api/system/CopyWriting?type=day_q`, {}, 'get').then(res => {
		Actions.push('CommonRules', { title: '常见问题', rules: res.data });
		});
	}
	/**
		 * 渲染我的服务
		 */
	renderService() {
		let SERVICE_BAR = [
		{ key: "0", title: "联系我们", icon: 'qq', router: 'qq' },
		{ key: "1", title: "常见问题", icon: 'server', router: 'CommonRules' },
		];
		return (
		<View style={Styles.barContainer}>
			
		</View>
		)
	}
	/**
		 * 服务Bar 点击事件
		 */
	handleServiceYoBang(item) {
		if (this.props.logged) {
		if (item.hasOwnProperty('router')) {
			if (item['router'] === 'CommonRules') {
			this.onServicePress()
			} else {
			Actions.push(item['router']);
			}
		} else {
			if (item['key'] === '0') this.onClickQQ();
		}
		} else {
		Actions.push('Login');
		}
	}
	/**
		 * 渲染哟帮
		 */
	renderHeader() {
		const { eyes } = this.state;
		return (
			<View style={{height: 150, backgroundColor: Colors.main, paddingHorizontal: 20}}>
				<View style={{height: 40, justifyContent: 'center', alignItems: 'flex-end'}}>
					<Pressable onPress={() => this.setState({eyes: !this.state.eyes})}>
						<Icon name={ eyes ? 'eye-outline' : 'eye-off-outline'} color={Colors.White} size={25} />
					</Pressable>
				</View>
				<View>
					<Text style={{fontSize: 14, color: Colors.White}}>总账户资产折合</Text>
					<Text style={{fontSize: 12, color: Colors.White, marginTop: 10}}><Text style={{fontSize: 16}}>{eyes ? 1234123 :'———'}</Text>  {eyes ? 12341234 :'_ _ _'}</Text>
				</View>
				<View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 15}}>
					<TouchableOpacity style={styles.headerTab} onPress={() => Actions.push('SelectCurrency', {type: 'chongbi'})}>
						<Text style={{color: Colors.White}} >充币</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.headerTab} onPress={() => Actions.push('SelectCurrency', {type: 'tibi'})}>
						<Text style={{color: Colors.White}} >提币</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.headerTab} onPress={() => Toast.tip('暂未开放')}>
						<Text style={{color: Colors.White}} >划转</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}
	renderList = () => {
		return (
			<View style={{flex: 1}}>
				<ScrollTopBar
                        borderBottom={true}
                        topBarUnderlineStyle={{ backgroundColor: Colors.mainTab, width: 40, height: 1, marginLeft: this.state.index === -1 ? 15 : 0, borderRadius: 1 }}
                        itemStyles={{padding: 15}}				                                                    // 下划线样式
                        labelList={['法币', '币币']}			// 标题栏素材
                        textStyles={{ fontSize: 16, fontWeight: 'bold',}}
                        topBarInactiveTextColor='#666666'		         // label 文字非选中颜色
                        topBarActiveTextColor={Colors.mainTab}	         // label 文字选中颜色
                        topBarBackgroundColor="#FFFFFF"	                 // 背景颜色
                        onChange={e => this.setState({ index: e })}
                    >
                        <LegalCoin isFocus={this.state.index === 0} />
                        <Currency isFocus={this.state.index === 1} />
                    </ScrollTopBar>
			</View>
		)
	}
	render() {
		return (
			<View style={{ flex: 1 }}>
				<StatusBar backgroundColor={Colors.main} animated={false}/>
				{/* <Header title="我的" isTabBar={true} rightIcon="gear" rightIconSize={24} onRightPress={() => { Actions.push(this.props.logged ? 'UserInfo' : 'Login') }} /> */}
				{this.renderHeader()}
				{this.renderList()}
			</View>
		);
	}
}
const mapStateToProps = state => ({
	name: state.user.name,
	isPay: state.user.isPay,
	alipayUid: state.user.alipayUid,
	logged: state.user.logged,
	userId: state.user.id,
	level: state.user.level,
	rcode: state.user.rcode,
	golds: state.user.golds,
	mobile: state.user.mobile,
	nickname: state.user.name,
	avatar: state.user.avatarUrl,
	balance: state.dividend.userBalance,
	candyH: state.user.candyH || 0,
	candyP: state.user.candyP,
	candyNum: state.user.candyNum,
	userBalanceNormal: state.dividend.userBalanceNormal,
	userBalanceLock: state.dividend.userBalanceLock
});
const mapDispatchToProps = dispatch => ({
	logout: () => dispatch({ type: LOGOUT }),
	updateUserInfo: (userInfo) => dispatch({ type: UPDATE_USER, payload: { userInfo } })
});
export default connect(mapStateToProps, mapDispatchToProps)(MineScreen);

const styles = StyleSheet.create({
	headerTab: {width: (Metrics.screenWidth-70)/3, borderWidth: 0.5, borderColor: '#84c8fb', height: 30, justifyContent: 'center', alignItems: 'center'},
});