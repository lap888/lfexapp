import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, InteractionManager } from 'react-native';
import { BoxShadow } from 'react-native-shadow';
import { Colors, Metrics } from '../../theme/Index';
import { EmptyComponent, ShowMore } from '../../components/Index';
import { Actions } from 'react-native-router-flux';
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view';
import { Send } from '../../../utils/Http';
export default class CollegeFAQList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pageIndex: 1,
            pageSize: 10,
            totalPage: 0,
            topicList: [],
        }
    }

    componentDidMount() {
        this.onHeaderRefresh();
    };


    onHeaderRefresh = () => {
        this.setState({ refreshState: RefreshState.HeaderRefreshing, pageIndex: 1 })
        let params = {
            pageIndex: 1,
            type: 2,
            pageSize: this.state.pageSize
        }
        Send('api/system/Notices', params).then(res => {
            if (res.code == 200) {
                this.setState({
                    topicList: res.data,
                    totalPage: res.recordCount,
                    refreshState: res.data.length < 1 ? RefreshState.EmptyData : RefreshState.Idle
                })
            } else {
                this.setState({
                    topicList: [],
                    totalPage: 0,
                    refreshState: RefreshState.EmptyData
                })
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
                type: 2,
                pageSize: that.state.pageSize
            }
            Send('api/system/Notices', params).then(res => {
                if (res.code == 200) {
                    this.setState({
                        topicList: that.state.topicList.concat(res.data),
                        totalPage: res.recordCount,
                        refreshState: this.state.topicList.length >= this.state.totalPage ? RefreshState.EmptyData : RefreshState.Idle,
                    })
                } else {
                    this.setState({
                        topicList: [],
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

    renderItem(item, index) {
        return (
            <TouchableOpacity style={{marginTop: 10}} onPress={() => { Actions.CollegeFAQ({ tId: item.id, info: item }) }}>
                <View style={{ height: 56, margin: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.C8, borderRadius: 5, borderColor: Colors.mainTab, borderWidth: 1 }}>
                    <View style={Styles.itemStyle}>
                        <Text style={Styles.title} numberOfLines={1}>{item.title}</Text>
                        <Text style={Styles.text}>
                            {item.ceratedAt}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    render() {
        return (
            <View style={Styles.container}>
                {this.props.type == "fqa" ?
                    <RefreshListView
                        data={this.state.topicList}
                        keyExtractor={this.keyExtractor}
                        renderItem={({ item, index }) => this.renderItem(item, index)}
                        refreshState={this.state.refreshState}
                        onHeaderRefresh={this.onHeaderRefresh}
                        onFooterRefresh={this.onFooterRefresh}
                        // 可选
                        footerRefreshingText='正在玩命加载中...'
                        footerFailureText='我擦嘞，居然失败了 =.=!'
                        footerNoMoreDataText='我是有底线的 =.=!'
                        footerEmptyDataText='我是有底线的 =.=!'
                    /> : <EmptyComponent></EmptyComponent>}
            </View>

        );
    }
}
const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        marginHorizontal: 15
    },
    itemStyle: {
        flex: 1,
        paddingRight: 15,
        marginLeft: 15,
        justifyContent: 'center'
    },
    transactionContainer: { left: 10, marginTop: 10 },
    verticalLine: { height: 35, width: 3, borderRadius: 3, backgroundColor: Colors.mainTab },
    title: { fontSize: 15, color: Colors.C0, fontWeight: '500' },
    text: { marginTop: 8, fontSize: 13, color: Colors.C2 }
});
