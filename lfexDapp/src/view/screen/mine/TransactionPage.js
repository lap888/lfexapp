/*
 * @Author: top.brids 
 * @Date: 2020-01-06 12:01:57 
 * @Last Modified by: top.brids
 * @Last Modified time: 2020-09-16 17:37:31
 */

import React, { Component } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view';
// import { Toast } from 'native-base';
import { UPDATE_USER } from '../../../redux/ActionTypes';
import { Metrics, Colors } from '../../theme/Index';
import { Trade } from '../../../models';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

class TransactionPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listData: [],
            pageIndex: 1,
            pageSize: 10,
            totalPage: 0
        };
    }
    componentDidMount() {
        this.onHeaderRefresh();
    }
    onHeaderRefresh = () => {
        this.setState({ refreshState: RefreshState.HeaderRefreshing, pageIndex: 1 })
        let params = {
            pageIndex: 1,
            status: 2,
            pageSize: this.state.pageSize,
            Sale: '',
            coinType: this.props.coinType
        }
        Send('api/Trade/MyTradeList', params).then(res => {
            if (res.code == 200) {
                this.setState({
                    listData: res.data,
                    totalPage: res.recordCount,
                    refreshState: res.data.length < 1 ? RefreshState.EmptyData : RefreshState.Idle
                })
                Trade.setTradeData(res.data);
            } else {
                this.setState({
                    listData: [],
                    totalPage: 0,
                    refreshState: RefreshState.EmptyData
                })
                Trade.setTradeData([]);
            }
        });
    }

    onFooterRefresh = () => {
        let that = this;
        that.setState({
            refreshState: RefreshState.FooterRefreshing,
            pageIndex: this.state.pageIndex + 1
        }, () => {
            let params = {
                pageIndex: that.state.pageIndex,
                status: 2,
                pageSize: that.state.pageSize,
                Sale: '',
                coinType: this.props.coinType
            }
            Send('api/Trade/MyTradeList', params).then(res => {
                if (res.code == 200) {
                    this.setState({
                        listData: that.state.listData.concat(res.data),
                        totalPage: res.recordCount,
                        refreshState: this.state.listData.length >= this.state.totalPage ? RefreshState.EmptyData : RefreshState.Idle,
                    })
                    Trade.setTradeData(that.state.listData.concat(res.data));
                } else {
                    this.setState({
                        listData: [],
                        totalPage: 0,
                        refreshState: RefreshState.EmptyData
                    })
                }
            });
        });
    }
    keyExtractor = (item, index) => {
        return index.toString()
    }

    displaypromptTxt(status, id) {
        if (status === 2) {
            return (
                <Text style={[Styles.cancleTxt, { color: Colors.mainTab }]}>
                    {this.props.userId === id ? "待付款" : "待买家付款"}
                </Text>
            )
        }
        if (status === 3) {
            return (
                <Text style={[Styles.cancleTxt, { color: Colors.mainTab }]}>
                    已付款
                </Text>
            )
        }
        if (status === 5) {
            return (
                <Text style={[Styles.cancleTxt, { color: Colors.mainTab }]}>
                    申诉中
                </Text>
            )
        }
    }
    callBack = () => {
        this.onHeaderRefresh()
        //刷新用户信息
        this.initData()
    }
    initData() {
        var that = this;
        Send("api/system/InitInfo", {}, 'GET').then(res => {
            if (res.code == 200) {
                that.props.updateUserInfo(res.data)
            } else {
                Toast.tipBottom(res.message)
            }
        });
    }
    renderItem(item) {
        return (
            <View style={Styles.transactionContainer}>
                <TouchableOpacity onPress={() => {
                    Actions.TransactionDetail({
                        tradeIdx: this.state.listData.lastIndexOf(item),
                        title: this.props.title,
                        callBack: this.callBack
                    })
                }}>
                    <View style={Styles.purchaseItemContainer}>
                        <View style={Styles.purchaseItemView}>
                            <View style={Styles.purchaseLabel}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={Styles.text}>{`订单号: `}</Text>
                                    <Text style={[Styles.text, { fontWeight: 'bold' }]}>{item.tradeNumber}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                                    <Text style={[Styles.text]}>{`单价: `}</Text>
                                    <Text style={[Styles.text]}>{`${this.props.title == 'bibi' ? '$' : '￥'}${item.price}`}</Text>
                                    <Text style={[Styles.text, { marginLeft: 50 }]}>{`数量: `}</Text>
                                    <Text style={[Styles.text]}>{item.amount}</Text>
                                </View>
                            </View>
                            <View style={{ flex: 3, marginRight: 15, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                {this.displaypromptTxt(item.status, item.buyerUid)}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    render() {
        return (
            <View style={Styles.container}>
                <RefreshListView
                    data={this.state.listData}
                    keyExtractor={this.keyExtractor}
                    renderItem={({ item, index }) => this.renderItem(item)}
                    refreshState={this.state.refreshState}
                    onHeaderRefresh={this.onHeaderRefresh}
                    onFooterRefresh={this.onFooterRefresh}
                    // 可选
                    footerRefreshingText='正在玩命加载中...'
                    footerFailureText='我擦嘞，居然失败了 =.=!'
                    footerNoMoreDataText='我是有底线的 =.=!'
                    footerEmptyDataText='我是有底线的 =.=!'
                />
            </View>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id,
    level: state.user.level,
    golds: state.user.golds,
});

const mapDispatchToProps = dispatch => ({
    updateUserInfo: (userInfo) => dispatch({ type: UPDATE_USER, payload: { userInfo } })
});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionPage);

const Styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.C8, },
    transactionContainer: { margin: 10, borderBottomWidth: 1, borderBottomColor: Colors.greyText, },
    purchaseItemContainer: {
        height: 75,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: Colors.C8,
        paddingTop: 19,
        paddingBottom: 19,
        borderRadius: 6,
        margin: 1,
    },
    purchaseItemView: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
    },
    verticalLine: {
        height: 25,
        width: 6.5,
    },
    purchaseLabel: {
        flex: 7,
        marginLeft: 6,
    },
    cancleView: {
        alignSelf: 'flex-end',
        justifyContent: 'center',
        marginRight: 15,
        backgroundColor: Colors.mainTab,
        borderRadius: 6,
        height: 40,
        width: 60,
    },
    text: {
        fontSize: 14,
        color: Colors.C0
    },
    cancleTxt: {
        color: "#ffffff",
        fontSize: 14,
        textAlign: "center"
    },
    modalBody: {
        flexDirection: "column",
        justifyContent: 'flex-end',
        backgroundColor: '#25252b',
        width: Metrics.screenWidth
    },
    publishBuy: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold'
    },
    currentPrice: {
        color: '#89898b',
        marginTop: 20,
        fontSize: 14,
    },
    modalBodyPrice: {
        marginTop: 26,
        flexDirection: 'row',
        alignItems: 'center'
    },
    modalBodyLeft: {
        width: Metrics.screenWidth * 0.3,
        alignItems: 'flex-end'
    },
    modalBodyRight: {
        width: Metrics.screenWidth * 0.7,
        alignItems: 'flex-start'
    },
    textInputContainer: {
        marginLeft: 10,
        paddingLeft: 8,
        width: Metrics.screenWidth * 0.7 * 0.8,
        height: 40, borderRadius: 6,
        backgroundColor: '#333339'
    },
    publishTextInput: {
        flex: 1,
        color: '#ceced0'
    },
    modalFooter: {
        flexDirection: 'row',
        marginTop: 20
    },
    publishConfirm: {
        height: 60,
        width: Metrics.screenWidth * 0.5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    publishConfirmText: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    modalHeader: {
        flex: 1,
        opacity: 0.6,
        backgroundColor: '#FFFFFF'
    },
    price: {
        fontSize: 14,
        color: '#ceced0'
    },
});