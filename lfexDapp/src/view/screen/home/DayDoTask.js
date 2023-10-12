import React, { Component } from 'react';
import { View, Image, Text, StyleSheet, NativeModules, TouchableOpacity, Platform } from 'react-native';
import { Actions } from 'react-native-router-flux';
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view';
import DeviceInfo from 'react-native-device-info';
// import { Toast } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import Cookie from 'cross-cookie';
import CryptoJS from 'crypto-js';
import { connect } from 'react-redux';

import { Send } from '../../../utils/Http';
import { Header } from '../../components/Index';
import { AUTH_SECRET, API_PATH, Env, Version } from '../../../config/Index';
import { Colors, Metrics } from '../../theme/Index';
import Advert from '../advert/Advert';
import { Toast } from '../../common';
import { UPDATE_USER } from '../../../redux/ActionTypes';
// const { RNMobad } = NativeModules;

// const FeiMa = NativeModules.FeiMaModule;
class DayDoTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transactionList: [],
            totalPage: 0,
            doTaskUrl: '',
            taskSchedule: props.taskSchedule,
        };
    }
    componentDidMount() {
        this.onHeaderRefresh();
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            this.onHeaderRefresh()
        }
    }

    onHeaderRefresh = () => {
        this.setState({ refreshState: RefreshState.HeaderRefreshing, pageIndex: 1 })

        Send('api/System/GetBaseTask', {}, 'get').then(res => {
            if (res.code == 200) {
                this.setState({
                    transactionList: res.data,
                    refreshState: res.data.length < 1 ? RefreshState.EmptyData : RefreshState.Idle
                })
            } else {
                this.setState({
                    transactionList: [],
                    totalPage: 0,
                    refreshState: RefreshState.EmptyData
                })
            }
        });
    }
    onPressDayTask = (item) => {
        if (!this.props.logged) {
            Actions.push("Login");
            return;
        }
        // taskType 解释:
        // 0：用户注册及认证-- -> 进入邀请好友界面
        // 1：广告分享----------> 进入首页[最好可以定位到广告位置]
        // 2：出售----------> 进入交易界面
        // 3：发布买单----------> 进入交易界面
        // 4：玩游戏------------> 进入游戏界面
        // 5：哟帮--------------> 进入YO帮界面
        if (item.taskType == 0) {
            Actions.jump("Invitation");
        } else if (item.taskType == 1) {
            Actions.jump("Home");
        } else if (item.taskType == 2 || item.taskType == 3) {
            Actions.jump("Otc");
        } else if (item.taskType == 4) {
            Actions.jump("Game");
        } else if (item.taskType == 5) {
            Actions.jump("Block");
        } else if (item.taskType == 7) {
            if (Platform.OS == "ios") {
                Toast.tipTop('苹果用户暂不支持')
                // Toast.show({
                //     text: "苹果用户暂不支持",
                //     textStyle: { color: '#FFFFFF', textAlign: 'center' },
                //     position: "top",
                //     duration: 2000
                // });
            } else {
                const callback = (res) => {
                    if (res) {
                        this.doDayTask()
                    }else{
                        Cookie.get('token').then(value => {
                            let token = value == null || value == '' ? '' : value;
                            let api = 'api/game/watchvedio';
                            let timeSpan = new Date().getTime().toString()
                            let auth = AUTH_SECRET;
                            let url = `${API_PATH}${api}`;
                            let sign = this.Sign(api, token, timeSpan)
                            FeiMa.openLookVideo(sign, url, api, token, timeSpan, auth)
                        })
                    }
                }
                Advert.rewardVideo(callback)
            }
        }
    }
    
        /**
     * 开始任务
     */
    doTask = () => {
        setTimeout(() => {
            Send("api/system/DoTask", {}, 'get').then(res => {
                if (res.code == 200) {
                    this.props.updateUserInfo({taskSchedule: res.data.taskSchedule});
                    this.setState({taskSchedule: res.data.taskSchedule})
                    if (Number(res.data.taskSchedule) >= 1) {
                        Send("api/system/InitInfo", {}, 'GET').then(res => {
                            if (res.code == 200) {
                                this.props.updateUserInfo(res.data);
                                Toast.tipTop('您已完成今日任务...返回查看收益')
                            }else{
                                Toast.tipTop(res.message)
                            } 
                        })
                    }
                } else {
                    Toast.tipTop(res.message)
                }
            });
        }, 10000);
        
        if (Platform.OS === "android") {
            Advert.rewardVideo();
        }else{
            // RNMobad.showAd();
        }
    }


    doDayTask = () => {
        let _imei = '999';
        const getDeviceId = DeviceInfo.getUniqueId();
        if(getDeviceId && getDeviceId != null) {
            _imei = getDeviceId;
        }if (getDeviceId == null) {
            _imei = '888'
        }
        Send('api/Game/WatchVedio', { postId: "3415", imei: _imei}).then(res => {
            if (res.code == 200) {
                Toast.tipTop('完成任务')
                this.onHeaderRefresh()
            } else {
                Toast.tipTop(res.message)
            }
        }).catch((err) => console.log(err));
    }

    Sign = (api, token, timeSpan) => {
        let params = [];
        params.push(api.toUpperCase());
        params.push(token.toUpperCase());
        params.push(timeSpan);
        params.push(AUTH_SECRET.toUpperCase());//服务端分发对应key
        params.sort();
        let utf8Params = CryptoJS.enc.Utf8.parse(params.join(''));
        let sign = CryptoJS.MD5(utf8Params).toString(CryptoJS.enc.Hex).substring(5, 29);
        return sign;
    }
    
    listHeaderComponent = () => {
        let speed = Number(this.state.taskSchedule);
        return (
            <View>
                <View style={{alignItems: 'center', marginVertical: 10}}>
                    <Image style={{height: 35}} resizeMode={'contain'} source={require('../../images/dayTask/mainbiaoti.png')}/>
                </View>
                <TouchableOpacity style={{ padding: 5, borderRadius: 10 }} onPress={this.doTask}>
                    <Image style={{ width: '100%', height: 160, overflow: "hidden", borderRadius: 10 }} source={require('../../images/dayTask/banner.gif')} />
                </TouchableOpacity>
                <View style={{ height: 15, borderRadius: 7.5, width: Metrics.screenWidth - 40, marginVertical: 5, backgroundColor: 'rgba(247,139,120,0.6)', marginLeft: 20}}>
                    <View style={{position: 'absolute', width: (Metrics.screenWidth - 40) * speed, height: 15, borderRadius: 7.5,  backgroundColor: Colors.mainTab, }}/>
                    <View style={{position: 'absolute', width: (Metrics.screenWidth - 40), height: 15, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{fontSize: 10}}>进度: {speed * 100}%</Text>
                    </View>
                </View>
                <View style={{alignItems: 'center', marginVertical: 10}}>
                    <Image style={{height: 35}} resizeMode={'contain'} source={require('../../images/dayTask/zhixian.png')}/>
                </View>
            </View>
        )
    }


    renderItem = ({item, index}) => {
        if (item.taskType == 99) {
            return ;
        }
        let source = require('../../images/doDayTaskIcon.png');
        switch (item.taskType) {
            case 1:
                source = require('../../images/dayTask/fenxiang.png');
                break;
            case 4:
                source = require('../../images/dayTask/tuijian.png');
                break;
            case 5:
                source = require('../../images/dayTask/daren.png');
                break;
            case 7:
                source = require('../../images/dayTask/shipin.png');
                break;
            case 3:
                source = require('../../images/dayTask/shougoutanpan.png');
                break;
            default:
                break;
        }
        return (
            <TouchableOpacity style={Styles.miningItem} onPress={() => { this.onPressDayTask(item) }}>
                <View style={Styles.miningItemHeader}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: 40, height: 40 }} resizeMode={'contain'} source={source} />
                        <View style={{flex: 1, marginLeft: 10}}>
                            <Text style={Styles.miningItemActivity}>{item.taskTitle}</Text>
                            <Text style={{ fontSize: 13, color: Colors.mainTab, marginLeft: 5 }}>{`完成任务奖励:${item.reward}果皮`}</Text>
                            <Text numberOfLines={3} style={Styles.miningItemName}>{`${item.taskDesc}`}</Text>
                        </View>
                    </View>
                    <View style={{ marginLeft: 10, height: 20, borderWidth: 1, borderColor: Colors.mainTab, borderRadius: 10, paddingHorizontal: 10, alignItems: 'center' }}>
                        <Text>{item.carry}/{item.aims}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    keyExtractor = (item, index) => {
        return index.toString()
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: Colors.White }}>
                <Header title="任务大厅" />
                <RefreshListView
                    data={this.state.transactionList}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={this.listHeaderComponent}
                    renderItem={this.renderItem}
                    refreshState={this.state.refreshState}
                    onHeaderRefresh={this.onHeaderRefresh}
                />
            </View>
        );
    }
}

const mapStateToProps = state => ({
    uuid: state.user.uuid,
    isDoTask: state.user.isDoTask,
    logged: state.user.logged,
    taskSchedule: state.user.taskSchedule,
});

const mapDispatchToProps = dispatch => ({
    updateUserInfo: (userInfo) => dispatch({ type: UPDATE_USER, payload: { userInfo } })
});
export default connect(mapStateToProps, mapDispatchToProps)(DayDoTask);

const Styles = StyleSheet.create({
    transactionContainer: { left: 15, marginBottom: 10 },
    transaction: { height: 200, margin: 1, flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 6, backgroundColor: '#FFFFFF' },
    avatar: { height: 50, width: 50, borderRadius: 25 },
    name: { fontWeight: 'bold', fontSize: 16 },
    body: { flex: 2, marginLeft: 14 },
    saleInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    price: { fontSize: 14, color: Colors.mainTab },
    number: { fontSize: 14, color: Colors.mainTab },
    transactionNumber: { fontSize: 14, color: "rgb(170,202,193)" },
    sale: { alignSelf: 'center', justifyContent: 'center', alignItems: 'center', padding: 5, paddingLeft: 10, paddingRight: 10, borderRadius: 5, backgroundColor: Colors.mainTab },
    saleText: { fontSize: 15, color: '#FFFFFF' },
    miningItem: { flex: 1, marginHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.C7},
    miningItemHeader: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    miningItemName: { fontSize: 13, marginLeft: 5 },
    miningItemActivity: { fontSize: 16, marginLeft: 5 },
    miningItembody: { marginTop: 10, flexDirection: 'row' },
    miningItemGemin: { fontSize: 14, color: Colors.C16, marginLeft: 5 },
    miningItemGemout: { fontSize: 14, color: Colors.C16, marginLeft: 5 },
    miningItemTime: { marginTop: 6, fontSize: 14, color: '#ffffff', width: 320 },
    miningItemFooter: { alignSelf: 'flex-end', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#ffffff', padding: 18, paddingTop: 10, paddingBottom: 10 },
    miningItemExchange: { fontSize: 18, color: '#ffffff' },
});
