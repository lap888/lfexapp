import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RefreshListView from 'react-native-refresh-list-view';
import { Colors } from '../../../theme/Index';
import { Coin } from '../../../../api';

export default class DealRank extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            refreshState: true
        };
    }

    componentDidMount() {
        this.getHomeRankList()
    }

    getHomeRankList = () => {
        Coin.findCoinRank({type: 2})
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
        console.log('item: ', item);
        return (
            <View key={index} style={{height: 60,  flexDirection: 'row', borderBottomWidth: 1,borderBottomColor: Colors.C13, marginLeft: 10,  }}>
                <View style={{width: 20, justifyContent: 'center',}}>
                    <Text style={{fontSize: 15, fontWeight: '700', color: Colors.main}}>{item.rankId}</Text>
                </View>
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <Text style={{fontSize: 14, color: Colors.C11, fontWeight: 'bold'}}>{item.name}</Text>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-start'}}>
                    <Text style={{fontSize: 14, color: Colors.C11, fontWeight: 'bold'}}>{item.nowPrice}</Text>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{backgroundColor: '#f5f9fc', width: 70, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: 2 }}>
                        <Text style={{fontSize: 14, color: Colors.main, fontWeight: 'bold'}}>{item.count24}</Text>
                    </View>
                </View>
            </View>
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
                                <View style={{height: 40,  flexDirection: 'row' }}>
                                    <View style={{flex: 1, justifyContent: 'center', marginLeft: 30}}>
                                        <Text style={{fontSize: 12, color: Colors.C10}}>名称</Text>
                                    </View>
                                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-start'}}>
                                        <Text style={{fontSize: 12, color: Colors.C10}}>最新价(CNY)</Text>
                                    </View>
                                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                        <Text style={{fontSize: 12, color: Colors.C10}}>24H成交额(BTC)</Text>
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
    list: { 
        flex: 1, 
        backgroundColor: Colors.C8, 
    },
})
