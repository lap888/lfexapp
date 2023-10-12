import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../components/Index';
import { Colors } from '../../theme/Index';
import RefreshListView, { RefreshState }  from 'react-native-refresh-list-view';
import { Coin } from '../../../api';

export default class FlowDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            type: props.type,
            detailList: [],
            pageSize: 20,
            pageIndex: 1,
            refreshState: true,
            moreData: true
        };
    }

    componentDidMount() {
        this.getCoinRecord(1)
    }

    getCoinRecord = (pageIndex) => { 
        Coin.getCoinRecord({CurrentId: this.state.data.accountId, PageIndex: pageIndex, PageSize: this.state.pageSize})
        .then((data) => {
            // [...this.state.detailList, data]
            this.setState({
                detailList: this.state.pageIndex == 1 ? data : this.state.detailList.concat(data), 
                refreshState: false,
                moreData: data.length < this.state.pageSize ? false : true 
            })
        }).catch((err) => this.setState({refreshState: false}))
    }

    onHeaderRefresh = () => {
        this.setState({refreshState: true, pageIndex: 1}, () => {
            this.getCoinRecord(1)
        })
    }
    
    onFooterRefresh = () => {
        let { moreData, refreshState, pageIndex} = this.state
        console.log('moreData: ', moreData);
        if (!moreData || refreshState) {
            return;
        }
        this.setState({ pageIndex: pageIndex+1, refreshState: true }, () => {
            this.getCoinRecord(this.state.pageIndex)
        })
    }


    renderItem = (item, index) => {
        return (
            <View key={index} style={styles.item} onPress={() => Actions.push('FlowDetails', {data: item})}>
                <View style={{justifyContent: 'center'}}>
                    <Text style={{fontSize: 14}} numberOfLines={2}>{item.modifyDesc}</Text>
                    {/* <Icon name={'right'} size={15} color={Colors.C11}/> */}
                </View>
                <View style={{flexDirection: 'row', marginTop: 5, flex: 1}}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{fontSize: 12, color: Colors.C10, }}>数量:  </Text>
                            <Text style={{fontSize: 12, color: Colors.C12}}>{item.incurred}</Text>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={{fontSize: 12, color: Colors.C10, }}>剩余:  </Text>
                            <Text style={{fontSize: 12, color: Colors.C12}}>{item.postChange}</Text>
                        </View>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                        <Text style={{fontSize: 12, color: Colors.C10, }}>时间</Text>
                        <Text style={{fontSize: 12, color: Colors.C12, marginTop: 3}}>{item.modifyTime}</Text>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        const { data, detailList, type } = this.state;
        return (
            <View style={{flex: 1}}>
                <Header title={data.coinType} />
                <View style={styles.headerView}>
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <Text style={{fontSize: 12, color: Colors.main, }}>可用</Text>
                        <Text style={{fontSize: 12, color: Colors.C12, marginTop: 5}}>{data.balance}</Text>
                    </View>
                    <View style={{flex: 1, justifyContent: 'center', }}>
                        <Text style={{fontSize: 12, color: Colors.main, }}>冻结</Text>
                        <Text style={{fontSize: 12, color: Colors.C12, marginTop: 5}}>{data.frozen}</Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                        <Text style={{fontSize: 12, color: Colors.main, }}>{type == 'currency' ? '折合(USDT)' : '折合(CNY)'}</Text>
                        <Text style={{fontSize: 12, color: Colors.C12, marginTop: 5}}>{data.usPrice}</Text>
                    </View>
                </View>
                <View style={{flex: 1}}>
                    <RefreshListView
                        data={detailList}
                        ListHeaderComponent={() => {
                            return (
                                <View style={{  justifyContent: 'center', padding: 10 }}>
                                    <Text style={{fontSize: 16, color: Colors.C12, fontWeight: '700'}}>财务记录</Text>
                                </View>
                            )
                        }}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => this.renderItem(item, index)}
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
            </View>
        );
    }
}
const styles = StyleSheet.create({
    headerView: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomColor: Colors.C13,
        borderBottomWidth: 10
    },
    item: {
        paddingVertical: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: Colors.C13, 
        paddingHorizontal: 10
    },
})
