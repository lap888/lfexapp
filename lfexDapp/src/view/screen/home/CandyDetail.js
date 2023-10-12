import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view';
import LinearGradient from 'react-native-linear-gradient';
import { Metrics, Colors } from '../../theme/Index';
import { Toast } from 'native-base';
import { Header, ShowMore, EmptyComponent, CandyListItem } from '../../components/Index';
import { Send } from '../../../utils/Http';
class CandyDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            candyNum: 0,
            freezeCandyNum: 0,
            pageIndex: 1,
            pageSize: 10,
            totalPage: 0,
            candyRecordList: [],
        }
    }
    componentDidMount() {
        this.onHeaderRefresh();
    };
    /**
     * 渲染Header Bar
     */
    renderHeader() {
        return (
            <LinearGradient colors={[Colors.mainTab, '#f0d9b0']} start={{ x: 0, y: 0.3 }} end={{ x: 0, y: 1 }} style={Styles.totalDiamond}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={Styles.totalNum}>{this.state.candyNum}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                        <FontAwesome name="money" color={Colors.White} size={16} />
                        <Text style={Styles.tTxt}>当前</Text>
                    </View>
                </View>
                <View style={{ flex: 1, alignItems: 'center', alignItems: 'center' }}>
                    <Text style={Styles.totalNum}>{this.state.freezeCandyNum}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                        <FontAwesome name="lock" color={Colors.White} size={16} />
                        <Text style={Styles.tTxt}>交易冻结</Text>
                    </View>
                </View>
            </LinearGradient>
        )
    }
    onHeaderRefresh = () => {
        this.setState({ refreshState: RefreshState.HeaderRefreshing, pageIndex: 1 })
        let params = {
            pageIndex: 1,
            pageSize: this.state.pageSize
        }
        Send('api/system/CandyRecord', params).then(res => {
            if (res.code == 200) {
                this.setState({
                    candyNum: res.data.candyNum,
                    freezeCandyNum: res.data.freezeCandyNum,
                    candyRecordList: res.data.candyRecord,
                    totalPage: res.recordCount,
                    refreshState: res.data.candyRecord.length < 1 ? RefreshState.EmptyData : RefreshState.Idle
                })
            } else {
                this.setState({
                    candyNum: 0,
                    freezeCandyNum: 0,
                    candyRecordList: [],
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
                pageSize: that.state.pageSize
            }
            Send('api/system/CandyRecord', params).then(res => {
                if (res.code == 200) {
                    this.setState({
                        candyRecordList: that.state.candyRecordList.concat(res.data.candyRecord),
                        totalPage: res.recordCount,
                        refreshState: this.state.candyRecordList.length >= this.state.totalPage ? RefreshState.EmptyData : RefreshState.Idle,
                    })
                } else {
                    this.setState({
                        candyNum: 0,
                        freezeCandyNum: 0,
                        candyRecordList: [],
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
	/**
	 * 渲染流水列表
	 */
    renderDismondList() {
        return (
            <RefreshListView
                data={this.state.candyRecordList}
                keyExtractor={this.keyExtractor}
                renderItem={({ item, index }) => <CandyListItem index={index} item={item} />}
                refreshState={this.state.refreshState}
                onHeaderRefresh={this.onHeaderRefresh}
                onFooterRefresh={this.onFooterRefresh}
                // 可选
                footerRefreshingText='正在玩命加载中...'
                footerFailureText='我擦嘞，居然失败了 =.=!'
                footerNoMoreDataText='我是有底线的 =.=!'
                footerEmptyDataText='我是有底线的 =.=!'
            />
        )
    }
    render() {
        return (
            <View style={Styles.container}>
                <Header title="明细" />
                {this.renderHeader()}
                {this.renderDismondList()}
            </View>
        );
    }
}

const mapStateToProps = state => ({
    userId: state.user.id,
})

export default connect(mapStateToProps, {})(CandyDetail);

const Styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#ffffff" },
    totalDiamond: {
        backgroundColor: Colors.mainTab,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 20,
    },
    totalNum: {
        color: Colors.C8,
        fontSize: 16
    },
    tTxt: {
        fontSize: 14,
        color: Colors.White,
        marginLeft: 4,
    },
});