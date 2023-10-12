import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableWithoutFeedback } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Swiper from 'react-native-swiper';

import { LOGOUT, UPDATE_USER_AVATAR } from '../../../redux/ActionTypes';
import { Colors, Metrics } from '../../theme/Index';
import MiningMachinery from './miningMachinery/MiningMachinery';
// import MiningMachinery from './MiningMachineryHook';
import { Loading, Toast } from '../../common';
import { Send } from '../../../utils/Http';
import { Coin } from '../../../api';
import ActiveApi from '../../../api/play/ActiveApi';
import { onPressSwiper } from '../../../utils/CommonFunction';
const PLAY_OPTIONS = [
    { key: 0, name: "实名认证", route: 'CertificationManual', image: require('../../images/play/shiming.png'), icon: 'graduation-cap' },
    { key: 1, name: "商学院", route: 'College', image: require('../../images/play/shangxueyuan.png'), icon: 'tasks' },
    { key: 2, name: "邀请好友", route: 'Invitation', image: require('../../images/play/yaoqing.png'), icon: 'user-md' },
    { key: 3, name: "我的团队", route: 'MyTeam', image: require('../../images/play/wodetuandui.png'), icon: 'steam-square' },
    { key: 4, name: "矿机", route: 'MiningMachineryShop', image: require('../../images/play/kuangji.png'), icon: '' },
    { key: 5, name: "矿池", route: 'OrePool', image: require('../../images/play/kuangchi.png'), icon: '' },
    { key: 6, name: "活动", route: 'Active', image: require('../../images/play/huodong.png'), icon: '' },
    { key: 7, name: "更多", route: 'Null', image: require('../../images/play/gengduo.png'), icon: '' },

];

class PlayScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            minningList: [{}],
            bannerList: [],
            isLoading: false,
            refreshing: false
        };
    }

    componentDidMount() {
        this.getMinningList()
        this.getbannerlist()
    }

    onRefresh = () => {
        this.getMinningList()
    }

    goback = () => {
        Actions.pop()
    }

    getMinningList = () => {
        Coin.getMinningList()
        .then((data) => {
            this.setState({
                minningList: data,
                refreshing: false
            })
        }).catch((err) => this.setState({ refreshing: false }))
    }

    getbannerlist = () => {
        ActiveApi.getActiveList(2)
        .then((data) => {
            this.setState({ bannerList: data });
        }).catch((err) => console.log('err', err))
    }
    setLoading = (value) => {
        this.setState({isLoading: value})
    }

    repairMinning = (mid) => {
        this.setState({isLoading: true})
        Coin.repairMinning(mid)
        .then((data) => {
            Toast.tip('修复成功')
            this.getMinningList()
            this.setState({isLoading: false})
        }).catch((err) => {this.setState({isLoading: false}); console.log('err', err)})
    }

    onOptionPress = (route) => {
        switch (route) {
            case 'CertificationManual':
                if (this.props.auditState == 1) {
                    Toast.tip('正在审核 请耐心等待...')
                    break;
                }else if (this.props.auditState == 2) {
                    Toast.tip('实名已通过')
                    break;
                }else{
                    Actions.push(route);
                    break;
                }
            case 'Null':
                Toast.tip('暂未开放')
                break;
            default:
                Actions.push(route);
                break;
        }
        
    }

    /**
    * 联系QQ客服
    */
    onClickQQ = () => {
        Send(`api/system/CopyWriting?type=call_me`, {}, 'get').then(res => {
            Actions.push('CommonRules', { title: '联系我们', rules: res.data });
        });
    }

    renderOptions = () => {
        return (
            <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 0, flexWrap: 'wrap' }}>
                {
                    PLAY_OPTIONS.map((item, index) => {
                        return (
                            <TouchableOpacity key={index} style={{width: (Metrics.screenWidth-40)/4, marginTop: 10}} onPress={() => this.onOptionPress(item.route)}>
                                <View style={styles.optionItem}>
                                    <Image source={item.image} style={{ width: 36, height: 36 }} />
                                    <Text style={styles.optionTitle}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        )
    }

    /**
	 * 渲染轮播图
	 */
	renderSwiper() {
		if (this.state.bannerList.length < 1) {
			return <View/>;
		}
		return (
			<View style={styles.wiper}>
				<Swiper 
					key={this.state.bannerList.length}
					horizontal={true}
					loop={true}
					autoplay={true}
					autoplayTimeout={16}
					removeClippedSubviews={false}
					paginationStyle={{ bottom: 1 }}
					showsButtons={false}
					activeDotStyle={{ width: 15, height: 3, backgroundColor: Colors.White, borderRadius: 1 }}
					dotStyle={{  width: 15, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }}
				>
				{this.state.bannerList.map(item =>
					<TouchableWithoutFeedback key={item.id.toString()} onPress={() => onPressSwiper(item, this.props.mobile, this.props.userId)}>
                        <Image
                            source={{ uri: item['imageUrl'] }}
                            style={styles.banner}
                        />
					</TouchableWithoutFeedback> 
				)}
				</Swiper>
			</View >
		)
    }
    
    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 40, alignItems: 'center', paddingHorizontal: 15 }}>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={this.goback}>
                            <Icon name={'home'} size={20} color={Colors.main} />
                            <Text style={{ marginLeft: 5 }}>大厅</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => Actions.push('UserInfo')}>
                            <Icon name={'settings'} size={20} color={Colors.main} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{paddingTop: 10}} refreshControl={ <RefreshControl refreshing={this.state.refreshing}  onRefresh={this.onRefresh}/> }>
                        {this.renderSwiper()}
                        {this.renderOptions()}
                        <View>
                            {this.state.minningList.map((item, index) => {
                                return (
                                    <MiningMachinery 
                                        ref={(miningMachinery) => this.machinery = miningMachinery} 
                                        key={index + JSON.stringify(item)} 
                                        data={item} 
                                        repair={this.repairMinning} 
                                        setLoading={this.setLoading}
                                        />
                                )
                            })}
                        </View>
                        <View style={{height: 20}}/>
                    </ScrollView>
                    <View style={styles.callWe}>
                        <Image source={require('../../images/play/lianxiwomen.png')}/>
                        <Text style={{color: Colors.blakText}} onPress={this.onClickQQ}>  联系我们</Text>
                    </View>
                    {this.state.isLoading ? <Loading/> : null}
                </View>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id,
    mobile: state.user.mobile,
    name: state.user.name,
    avatarUrl: state.user.avatarUrl,
    inviterMobile: state.user.inviterMobile,
    reWeChatNo: state.user.reWeChatNo,
    reContactTel: state.user.reContactTel,
    myWeChatNo: state.user.myWeChatNo,
    myContactTel: state.user.myContactTel,
    auditState: state.user.auditState,

});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch({ type: LOGOUT }),
    updateUserAvatar: avatar => dispatch({ type: UPDATE_USER_AVATAR, payload: { avatar } })
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayScreen);

const styles = StyleSheet.create({
    optionTouch: { 
        flex: 1
    },
    optionItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTitle: { 
        marginTop: 8, 
        fontSize: 14
    },
    callWe: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        // position: 'absolute',
        // bottom: 0,
        backgroundColor: Colors.transparent, 
        marginVertical: 10
    },
	wiper: { 
        height: 60, 
        overflow: "hidden", 
        marginVertical: 5, 
        marginHorizontal: 15,
        borderRadius: 6 
    },
	banner: { 
        height: 60, 
        width: '100%' 
    },
})