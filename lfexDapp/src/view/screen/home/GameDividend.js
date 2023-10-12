/*
 * @Author: top.brids 
 * @Date: 2019-12-30 09:09:54 
 * @Last Modified by: top.brids
 * @Last Modified time: 2020-04-26 23:42:02
 */

import React, { Component } from 'react';
import { View, Text, TouchableWithoutFeedback, TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import { Icon } from 'native-base';
import { UPDATE_DIVIDEND_INFO } from '../../../redux/ActionTypes';
import { MathFloat } from '../../../utils/Index';
import { Metrics, Colors } from '../../theme/Index';
import { Header, ListGap } from '../../components/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

class GameDividend extends Component {
    constructor(props) {
        super(props);
        this.state = {
            walletDrawRule: []
        };
    }

    componentDidMount() {
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => this.fetchBalance());
        this.loadWalletDrawPRule();
    }
    loadWalletDrawPRule = () => {
        Send(`api/system/CopyWriting?type=wallet_draw_rule`, {}, 'get').then(res => {
            this.setState({
                walletDrawRule: res.data
            })
        });
    }

    componentWillUnmount() {
        if (this.willFocusSubscription) this.willFocusSubscription.remove();
    }
    /**
     * 获取提现金额信息
     */
    fetchBalance() {
        var that = this;
        Send("api/Account/WallerInfo", {}, 'get').then(res => {
            if (res.code == 200) {
                let { availableAmount, totalAmount, freezeAmount, totalOutlay, totalIncome } = res.data;
                that.props.resetDividendInfo(totalAmount, freezeAmount, availableAmount);
            } else {
                Toast.tipBottom(res.message)
                // Toast.show({
                //     text: res.message,
                //     textStyle: { color: '#FFFFFF', textAlign: 'center' },
                //     position: "bottom",
                //     duration: 2000
                // });
            }
        });
    }
    /**
     * 进入分红规则界面
     */
    toGameDividendRule() {
        Actions.push('CommonRules', { title: '钱包提现', rules: this.state.walletDrawRule });
    }
    render() {
        let { userBalanceLock, userBalanceNormal, userBalanceTotal } = this.props;
        let enableWithDraw = userBalanceNormal >= 10;
        return (
            <View style={Styles.containr}>
                <Header title="钱包" />
                <LinearGradient colors={[Colors.mainTab, Colors.LightG]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={Styles.dividendBar}>
                    <View style={Styles.gradient}>
                        <Text style={Styles.balance}>账户余额</Text>
                        <View style={Styles.gradientHeader}>
                            <Text style={Styles.unit}>¥</Text>
                            <Text style={Styles.balanceText}>{MathFloat.floor(userBalanceTotal, 2)}</Text>
                        </View>
                        <View style={Styles.gradientBody}>
                            <View style={Styles.gradientBodyItem}>
                                <Text style={Styles.gradientBodyTitle}>可提现金额</Text>
                                <Text style={Styles.gradientBodyText}>{MathFloat.floor(userBalanceNormal, 2)}</Text>
                            </View>
                            <View style={{ height: 40, width: StyleSheet.hairlineWidth, backgroundColor: Colors.C9 }} />
                            <View style={Styles.gradientBodyItem}>
                                <Text style={Styles.gradientBodyTitle}>冻结金额</Text>
                                <Text style={Styles.gradientBodyText}>{MathFloat.floor(userBalanceLock, 2)}</Text>
                            </View>
                        </View>
                        <TouchableOpacity disabled={!enableWithDraw} onPress={() => Actions.push('GameDividendWithDraw')}>
                            <View style={[Styles.withDraw, { backgroundColor: enableWithDraw ? Colors.mainTab : Colors.C16 }]}>
                                <Text style={Styles.withDrawText}>{`${!enableWithDraw ? '¥10.00起提' : '提现'}`}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            Actions.push('WalletPay');
                        }}>
                            <View style={[Styles.withDraw, { backgroundColor: Colors.mainTab }]}>
                                <Text style={Styles.withDrawText}>{`充值`}</Text>
                            </View>
                        </TouchableOpacity>
                        <ListGap style={{ marginTop: 20, width: Metrics.screenWidth - 30 }} />
                        <TouchableWithoutFeedback onPress={() => Actions.push('GameDividendIncomeList')}>
                            <View style={[Styles.withDrawRecord, { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.C7 }]}>
                                <Text style={Styles.withDrawRecordText}>钱包流水</Text>
                                <Icon name="arrow-forward" style={{ color: Colors.C11, fontSize: 20 }} />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <TouchableWithoutFeedback onPress={() => this.toGameDividendRule()}>
                        <View style={Styles.gradientFooter}>
                            <Text style={Styles.rule}>规则及常见问题</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </LinearGradient>
            </View>
        );
    }
}
const mapStateToProps = state => ({
    userId: state.user.id,
    userBalance: state.dividend.userBalance,
    userBalanceLock: state.dividend.userBalanceLock,
    userBalanceNormal: state.dividend.userBalanceNormal,
    userBalanceTotal: state.dividend.userBalanceTotal
});

const mapDispatchToProps = dispatch => ({
    resetDividendInfo: (userBalanceTotal, userBalanceLock, userBalanceNormal) => dispatch({ type: UPDATE_DIVIDEND_INFO, payload: { userBalanceLock, userBalanceNormal, userBalanceTotal } })
});

export default connect(mapStateToProps, mapDispatchToProps)(GameDividend);

const Styles = StyleSheet.create({
    containr: { flex: 1, backgroundColor: Colors.C8 },
    dividendBar: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    dividendText: { fontSize: 14, color: Colors.C8 },
    gradient: { width: Metrics.screenWidth - 30, backgroundColor: Colors.C8, borderRadius: 4, alignItems: 'center' },
    balance: { fontSize: 15, color: Colors.C11, marginTop: 30 },
    gradientHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    unit: { fontSize: 16, color: Colors.C11 },
    balanceText: { marginLeft: 8, fontSize: 16, color: Colors.C11 },
    withDraw: { width: Metrics.screenWidth * 0.5, marginTop: 10, paddingTop: 14, paddingBottom: 14, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    withDrawText: { color: Colors.C8, fontSize: 13 },
    gradientBody: { flexDirection: 'row', marginTop: 20 },
    gradientBodyItem: { flex: 1, alignItems: 'center' },
    gradientBodyTitle: { fontSize: 15, color: Colors.C10 },
    gradientBodyText: { marginTop: 6, fontSize: 13, color: Colors.C10 },
    withDrawRecord: { padding: 20, paddingTop: 15, paddingBottom: 15, flexDirection: 'row', alignItems: 'center' },
    withDrawRecordText: { flex: 1, fontSize: 15, color: Colors.C11 },
    gradientFooter: { padding: 40, paddingTop: 10 },
    rule: { fontSize: 15, color: Colors.C0, marginTop: 20 },
});