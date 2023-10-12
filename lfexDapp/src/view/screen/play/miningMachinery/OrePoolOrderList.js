import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view';
import moment from 'moment';

import { Coin } from '../../../../api';
import { Toast } from '../../../common';
import { Header } from '../../../components/Index';
import { Colors } from '../../../theme/Index';

export default class OrePoolOrderList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshState: '',
            pageSize: 20,
            pageIndex: 1,
            status: 0, // 0锁仓订单，1赎回订单
            moreData: true,
        };
    }

    componentDidMount() {
        this.getOrderList(1);
    }

    getOrderList = (pageIndex) => {
        Coin.minnersOrder({pageSize: this.state.pageSize, pageIndex: pageIndex, Status: this.state.status})
        .then((data) => {
            console.log('data', data);
            this.setState({
                data: this.state.pageIndex == 1 ? data : this.state.detailList.concat(data), 
                refreshState: data.length < this.state.pageSize ? RefreshState.EmptyData : RefreshState.Idle,
            })
        }).catch((err) => this.setState({ refreshState: RefreshState.EmptyData }))
    }

    stopOrder = (orderId) => {
        Coin.stopOrder(orderId)
        .then((data) => {
            Toast.tip('赎回成功');
            this.onHeaderRefresh()
        }).catch((err) => console.log('err', err))
    }

    onHeaderRefresh = () => {
        this.setState({ refreshState: RefreshState.HeaderRefreshing, pageIndex: 1 }, () => {
            this.getOrderList(1);
        })
        
    }

    onFooterRefresh = () => {
        this.setState({ refreshState: RefreshState.FooterRefreshing, pageIndex: this.state.pageIndex + 1, }, () => {
            this.getOrderList(this.state.pageIndex);
        })
        
    }

    select = (status) => {
        this.setState({ status: status }, () => this.onHeaderRefresh())
    }

    redeemLF = (item) => {
        if (item.status == 0 && item.type == 0) {
            this.stopOrder(item.id)
        }
        if (item.status == 0 && item.type == 1) {
            Toast.tip('锁仓期间不可赎回')
        }
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
                <Header title={'订单'} />
                <View style={{flexDirection: 'row', height: 40, backgroundColor: Colors.White}}>
                    <TouchableOpacity style={{flex: 1, alignItems: 'center' }} onPress={() => this.select(0)}>
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: this.state.status == 0 ? Colors.mainTab : Colors.C12,}}>锁仓订单</Text>
                        </View>
                        <View style={{height: 2, width: 80, backgroundColor: this.state.status == 0 ? Colors.mainTab : Colors.White}}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flex: 1, alignItems: 'center' }} onPress={() => this.select(1)}>
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: this.state.status == 1 ? Colors.mainTab : Colors.C12,}}>赎回订单</Text>
                        </View>
                        <View style={{height: 2, width: 80, backgroundColor: this.state.status == 1 ? Colors.mainTab : Colors.width}}/>
                    </TouchableOpacity>
                </View>
                <RefreshListView
                    data={this.state.data}
                    keyExtractor={this.keyExtractor}
                    renderItem={({ item, index }) => 
                        <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.White, marginTop: 10, padding: 10, marginHorizontal: 15, borderRadius: 5}}>
                            <View style={{flex: 1}}>
                                <Text style={{fontSize: 12, color: Colors.greyText}}>订单号: <Text style={{color: Colors.blakText}}>{item.id}</Text></Text>
                                <Text style={{fontSize: 12, color: Colors.greyText, marginVertical: 10}}>锁仓金额: <Text style={{fontSize: 14, color: Colors.blakText}}>{item.amount}</Text></Text>
                                {item.type === 0 && <Text style={{fontSize: 12, color: Colors.greyText}}>随时提出</Text>}
                                {item.type === 1 && <Text style={{fontSize: 12, color: Colors.greyText}}>时间: {moment(item.startTime).format('YYYY-MM-DD')} ~ {moment(item.endTime).format('YYYY-MM-DD')}</Text>}
                            </View>
                            {item.status === 0 && <TouchableOpacity style={styles.itemBtn} onPress={() => this.redeemLF(item)}>
                                <Text style={{fontSize: 12, color: Colors.White}}>赎回</Text>
                            </TouchableOpacity>}
                        </View>
                    }
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

const styles = StyleSheet.create({
    itemBtn: {height: 30, backgroundColor: Colors.main, paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 5}
})