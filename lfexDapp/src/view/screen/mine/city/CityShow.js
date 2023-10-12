import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, TouchableWithoutFeedback, ScrollView, DeviceEventEmitter } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'native-base';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import { Header } from '../../../components/Index';
import { Colors, Metrics } from '../../../theme/Index';
import { Send } from '../../../../utils/Http';
import { Toast } from '../../../common';

class CityShow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cityData: ''
        };
    }

    componentDidMount() {
        this.getCityData()
        this.listeners = DeviceEventEmitter.addListener('citySetting', ()=> {
            this.getCityData()  
        })
    }
    getCityData =() => {
        Send(`api/city/Info?code=${this.props.location.cityCode}`, {}, 'get').then(res => {
            this.setState({ cityData: res.data })
        })
    }
    componentWillUnmount(){
        this.listeners.remove()
    }
    onRightPress() {
        if (this.props.userId == this.state.cityData.userId) {
            Actions.push("CitySetting", {mobile: this.state.cityData.mobile, weChat: this.state.cityData.weChat, cityNo: this.state.cityData.cityNo})
            return;
        }
    }
    jumpToCityDivideList(dividendType, accountType) {
        if (this.props.userId != this.state.cityData.userId) {
            Toast.tipTop('非城主无权查看城主数据')
            return;
        }
        Actions.CityDivideList({ dividendType: dividendType, accountType: accountType, cityNo: this.props.location.cityCode });

    }
    /**
        * 渲染变色版
    */
    renderGradient() {
        let { avatar } = this.props;
        return (
            <LinearGradient colors={[Colors.mainTab, Colors.LightG]} start={{ x: 0, y: 0.1 }} end={{ x: 0, y: 1 }} style={Styles.gradient}>
                <View style={{minHeight: 80}}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Image source={{ uri: this.state.cityData.avatar }} style={Styles.avatar} />
                        <View style={{ flex: 1 }}>
                            <View style={Styles.setting}>
                                <Text style={Styles.nickname} numberOfLines={2}>{this.state.cityData.cityName || "暂无"}</Text>
                                <Text style={Styles.version}>{`${this.state.cityData.cityName}合伙人`}</Text>
                            </View>
                            <View style={{marginLeft: 10, marginTop: 5, flex: 1}}>
                                {this.state.cityData.mobile == '' ? null : <Text style={[Styles.inviteCode, { fontSize: 14 }]}>手机号: {this.state.cityData.mobile}</Text>}
                                {this.state.cityData.weChat == '' ? null : <Text style={[Styles.inviteCode, { fontSize: 14 }]}>微信号: {this.state.cityData.weChat}</Text>}
                                <Text style={[Styles.inviteCode, { fontSize: 12 }]}>{`有效期: ${this.state.cityData.effectiveTime || "暂无"}`}</Text>
                            </View>
                        </View>
                        
                    </View>
                </View>
                {this.renderYoBang()}
            </LinearGradient >
        )
    }
    handleServiceYoBang() {

    }
    renderYoBang() {
        let SERVICE_BAR = [
            { key: "0", title: "收益", icon: 'eercast', router: 'YoTaskSetting' },
            { key: "1", title: "现金收益", icon: 'superpowers', router: 'MyYoTask' },
            { key: "2", title: "城市人数", icon: 'microchip', router: 'YoTaskApeal' }
        ];
        return (
            <View style={Styles.barContainer}>
                <View style={Styles.barHeader}>
                    <Text style={Styles.barTitle}>城市信息</Text>
                </View>
                <View style={Styles.barBody}>
                    {SERVICE_BAR.map(item =>
                        <TouchableWithoutFeedback key={item['key']} onPress={() => this.handleServiceYoBang(item)}>
                            <View style={Styles.barBodyItem}>
                                <Text style={Styles.barText}>{this.props.userId == this.state.cityData.userId ? item['title'] == "收益" ? this.state.cityData.candyEarnings : item['title'] == "现金收益" ? this.state.cityData.cashEarnings : item['title'] == "城市人数" ? this.state.cityData.people : 0 : "--"}</Text>
                                <Text style={Styles.barText}>{item['title']}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </View>
            </View>
        )
    }
    render() {
        if (this.state.cityData === '') {
            return <View/>
        }
        
        return (
            <LinearGradient colors={[Colors.mainTab, Colors.LightG]} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0.5 }} style={{ flex: 1 }}>
                <Header title="我的城市" rightText={this.props.userId == this.state.cityData.userId ? "设置" : ''} onRightPress={() => this.onRightPress()} />
                {this.renderGradient()}
                <ScrollView>
                    <TouchableOpacity style={Styles.labelContainer} onPress={() => this.jumpToCityDivideList(1, 1)}>
                        <Text style={Styles.lableTxt}>哟帮现金分红「{`${this.props.userId == this.state.cityData.userId ? this.state.cityData.yoBangCash : "--"}`}」</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}>
                            <Icon name="arrow-forward" style={{ color: Colors.mainTab, fontSize: 20 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.labelContainer} onPress={() => this.jumpToCityDivideList(1, 2)}>
                        <Text style={Styles.lableTxt}>哟帮分红「{`${this.props.userId == this.state.cityData.userId ? this.state.cityData.yoBangCandy : "--"}`}」</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}>
                            <Icon name="arrow-forward" style={{ color: Colors.mainTab, fontSize: 20 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.labelContainer} onPress={() => this.jumpToCityDivideList(2, 1)}>
                        <Text style={Styles.lableTxt}>广告分红「{`${this.props.userId == this.state.cityData.userId ? this.state.cityData.videoDividend : "--"}`}」</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}>
                            <Icon name="arrow-forward" style={{ color: Colors.mainTab, fontSize: 20 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.labelContainer} onPress={() => this.jumpToCityDivideList(3, 1)}>
                        <Text style={Styles.lableTxt}>游戏分红「{`${this.props.userId == this.state.cityData.userId ? this.state.cityData.gameDividend : "--"}`}」</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}>
                            <Icon name="arrow-forward" style={{ color: Colors.mainTab, fontSize: 20 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.labelContainer} onPress={() => this.jumpToCityDivideList(4, 1)}>
                        <Text style={Styles.lableTxt}>商城分红「{`${this.props.userId == this.state.cityData.userId ? this.state.cityData.mallDividend : "--"}`}」</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}>
                            <Icon name="arrow-forward" style={{ color: Colors.mainTab, fontSize: 20 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.labelContainer} onPress={() => this.jumpToCityDivideList(5, 1)}>
                        <Text style={Styles.lableTxt}>拉新分红「{`${this.props.userId == this.state.cityData.userId ? this.state.cityData.pullNew : "--"}`}」</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}>
                            <Icon name="arrow-forward" style={{ color: Colors.mainTab, fontSize: 20 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.labelContainer} onPress={() => this.jumpToCityDivideList(6, 2)}>
                        <Text style={Styles.lableTxt}>任务分红「{`${this.props.userId == this.state.cityData.userId ? this.state.cityData.taskCandy : "--"}`}」</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}>
                            <Icon name="arrow-forward" style={{ color: Colors.mainTab, fontSize: 20 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.labelContainer} onPress={() => this.jumpToCityDivideList(7, 2)}>
                        <Text style={Styles.lableTxt}>交易分红「{`${this.props.userId == this.state.cityData.userId ? this.state.cityData.transactionCandy : "--"}`}」</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: "center" }}>
                            <Icon name="arrow-forward" style={{ color: Colors.mainTab, fontSize: 20 }} />
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        );
    }
}

const mapDispatchToProps = dispatch => ({

});


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
    location: state.user.location,
    nickname: state.user.name,
    avatar: state.user.avatarUrl,
    balance: state.dividend.userBalance,
    candyH: state.user.candyH || 0,
    candyP: state.user.candyP,
    candyNum: state.user.candyNum,
    userBalanceNormal: state.dividend.userBalanceNormal,
    userBalanceLock: state.dividend.userBalanceLock
});


export default connect(mapStateToProps, mapDispatchToProps)(CityShow);

const Styles = StyleSheet.create({
    gradient: { padding: 15, paddingTop: 0, paddingBottom: 20 },
    avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 0.5, borderColor: Colors.C8 },
    nickname: { fontSize: 18, color: Colors.C8, fontWeight: '500' },
    inviteCode: { fontSize: 15, color: Colors.C8, },
    setting: { flexDirection: 'row', paddingLeft: 10, alignItems: 'center', justifyContent: 'space-between' },
    version: { marginTop: 2, fontSize: 14, color: Colors.C8 },
    profile: { flexDirection: 'row', alignItems: 'center' },
    profileItem: { flex: 1, alignItems: 'center' },
    profileTitle: { marginTop: 2, fontSize: 16, color: Colors.C8 },
    profileText: { fontSize: 14, color: Colors.C8 },
    level: { height: 70, width: Metrics.screenWidth - 30, borderRadius: 15, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.C8 },
    levelText: { fontSize: 19, color: Colors.mainTab, fontWeight: 'bold' },
    contributionValueText: { marginTop: 4, fontSize: 14, color: Colors.C0 },
    levelPropaganda: { fontSize: 15, color: Colors.C10 },
    icon: { width: 30, height: 30 },
    barContainer: { width: Metrics.screenWidth - 30, borderRadius: 15, alignSelf: 'center', backgroundColor: Colors.C8, marginTop: 15 },
    barHeader: { flexDirection: 'row', padding: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.C7 },
    barTitle: { fontSize: 15, color: Colors.C10, fontWeight: '500' },
    barHeaderRight: { flex: 1 },
    barMore: { textAlign: 'right', fontSize: 14, color: Colors.C10 },
    barBody: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 10, paddingBottom: 14 },
    barBodyItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    barText: { marginTop: 6, fontSize: 14, color: Colors.C10 },
    badge: { position: 'absolute', left: 20, top: -2 },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 52,
        marginLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.C7
    },
    lableTxt: { fontSize: 16, color: Colors.C11 },
    signOutView: { justifyContent: 'center', alignItems: "center" },
    signOutBtn: { marginTop: 50, width: Metrics.screenWidth * 0.6, backgroundColor: Colors.mainTab, alignItems: "center", borderRadius: 8 }
});
