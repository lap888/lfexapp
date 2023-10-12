import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RefreshListView from 'react-native-refresh-list-view';
import { Colors } from '../../../theme/Index';
import { Coin } from '../../../../api';
import { number } from 'prop-types';
import { Actions } from 'react-native-router-flux';

export default class IncreaseRank extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            refreshState: true,
        };
    }

    componentDidMount() {
        this.getHomeRankList()
    }

    getHomeRankList = () => {
        Coin.findCoinRank({type: 0})
        .then((data) => {
            this.setState({
                data: data,
                refreshState: false
            })
        }).catch((err) => console.log('err', err))
    }

    onHeaderRefresh = () => {
        this.getHomeRankList()
    }

    renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity key={index} onPress={() => Actions.push('MarketScreen', {item})} style={{height: 60,  flexDirection: 'row', borderBottomWidth: 1,borderBottomColor: Colors.C13, marginLeft: 10,  }}>
                <View style={{width: 20, justifyContent: 'center',}}>
                    <Text style={{fontSize: 15, fontWeight: '700', color: Colors.main}}>{item.rankId}</Text>
                </View>
                <View style={{flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{flex: 1}}>
                        <Text style={{fontSize: 11, color: Colors.C10}}><Text style={{fontSize: 14, fontWeight: 'bold', color: Colors.C12}}>{item.name}</Text>/USDT</Text>
                        <Text style={{fontSize: 11, color: Colors.C10, marginTop: 3}}>24H量 {item.count24}</Text>
                    </View>
                </View>
                <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 14, fontWeight: 'bold', color: Colors.C12}}>{item.nowPrice}</Text>
                        <Text style={{fontSize: 11, color: Colors.C10, marginTop: 3}}>≈ ¥{(Number(item.nowPrice) * 7).toFixed(5)}</Text>
                </View>
                <View style={{flex: 3, justifyContent: 'center', alignItems: 'flex-end',marginRight: 20 }}>
                    <View style={[styles.itemBaifenbi, {backgroundColor: item.upDown && item.upDown > 0 ? '#11b787' : '#ed4c5c' }]}>
                        <Text style={{fontSize: 13, fontWeight: 'bold', color: Colors.White,}}>{item.upDown}%</Text>
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
            <View style={styles.container}>
                <View style={styles.list}>
                    <RefreshListView
                        data={this.state.data}
                        ListHeaderComponent={() => {
                            return (
                                <View style={styles.headerView}>
                                    <View style={styles.headerName}>
                                        <Text style={styles.headerTxt}>名称</Text>
                                    </View>
                                    <View style={styles.headerNew}>
                                        <Text style={styles.headerTxt}>最新价</Text>
                                    </View>
                                    <View style={styles.headerFudu}>
                                        <Text style={styles.headerTxt}>涨跌幅</Text>
                                    </View>
                                </View>
                            )
                        }}
                        keyExtractor={this.keyExtractor}
                        renderItem={this.renderItem}
                        refreshState={this.state.refreshState}
                        onHeaderRefresh={this.onHeaderRefresh}
                        // onFooterRefresh={this.onFooterRefresh}
                        // 可选
                        footerRefreshingText='正在玩命加载中...'
                        footerFailureText='我擦嘞，居然失败了 =.=!'
                        // footerNoMoreDataText='我是有底线的 =.=!'
                        // footerEmptyDataText='我是有底线的 =.=!'
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: Colors.White,
    },
    list: { flex: 1, backgroundColor: Colors.C8, },
    headerView: {height: 40,  flexDirection: 'row' },
    headerName: {flex: 2, justifyContent: 'center', marginLeft: 30},
    headerTxt: {fontSize: 12, color: Colors.C10},
    headerNew: {flex: 2, justifyContent: 'center', alignItems: 'center'},
    headerFudu: {flex: 3, justifyContent: 'center', alignItems: 'flex-end',marginRight: 20},
    itemBaifenbi: { width: 70, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: 2 },
})
