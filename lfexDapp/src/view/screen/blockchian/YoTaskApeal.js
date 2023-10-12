import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    View, Text, StyleSheet, Modal, Image, TouchableOpacity, Clipboard,
    TextInput, Keyboard, ScrollView, TouchableWithoutFeedback, Alert, Switch, Animated, Linking, Platform
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view';
import { Header, PicturePreview } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';

import { Send } from '../../../utils/Http';
import { Actions } from 'react-native-router-flux';

class YoTaskApeal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            order: 1,
            dataList: []
        };
    }

    componentDidMount() {
        this.onHeaderRefresh();
    }

    /**
   * 排序条件变更
   * @param {*} key 
   */
    onChangeSequence(key) {
        let { order } = this.state;
        let newOrder = order;
        if (order !== key) {
            newOrder = key;
        }
        this.setState({ order: newOrder }, () => {
            this.onHeaderRefresh();
        });
    }
    /**
       * 渲染统计栏目
       */
    renderHeaderComponent() {

        const YoTaskTitle = [
            { key: 1, title: '我被举报' },
            { key: 2, title: '我的举报' },
        ]
        let { order } = this.state;
        return (
            <View style={{ marginBottom: 5, }}>
                <LinearGradient colors={[Colors.mainTab, Colors.White]} start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sequence}>
                    {YoTaskTitle.map(item => {
                        let { key, title } = item;
                        let itemSelected = order === key;
                        return (
                            <TouchableWithoutFeedback key={key} onPress={() => this.onChangeSequence(key)}>
                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={[styles.sequenceTitle, { color: itemSelected ? Colors.White : Colors.C11 }]}>{title}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        )
                    })}
                </LinearGradient >
            </View>
        )
    }
    onHeaderRefresh = () => {
        this.setState({ refreshState: RefreshState.HeaderRefreshing, pageIndex: 1 }, () => {
            // Send('api/YoBang/MyTask', { taskState: this.state.order, pageIndex: this.state.pageIndex }).then(res => {
            //     if (res.code == 200) {
            //         this.setState({
            //             dataList: res.data.list,
            //             totalPage: res.data.total,
            //             refreshState: res.data.list.length < 1 ? RefreshState.EmptyData : RefreshState.Idle
            //         })
            //     } else {
            //         this.setState({
            //             dataList: [],
            //             totalPage: 0,
            //             refreshState: RefreshState.EmptyData
            //         })
            //     }
            // });
            this.setState({
                dataList: [],
                totalPage: 0,
                refreshState: 0 < 1 ? RefreshState.EmptyData : RefreshState.Idle
            })
        });
    }

    onFooterRefresh = () => {
        let that = this;
        that.setState({
            refreshState: RefreshState.FooterRefreshing,
            pageIndex: this.state.pageIndex + 1
        }, () => {
            // Send('api/YoBang/MyTask', { taskState: this.state.order, pageIndex: this.state.pageIndex }).then(res => {
            //     if (res.code == 200) {
            //         this.setState({
            //             dataList: that.state.dataList.concat(res.data.list),
            //             totalPage: res.data.total,
            //             refreshState: this.state.dataList.length >= this.state.totalPage ? RefreshState.EmptyData : RefreshState.Idle,
            //         })
            //     } else {
            //         this.setState({
            //             dataList: [],
            //             totalPage: 0,
            //             refreshState: RefreshState.EmptyData
            //         })
            //     }
            // });
            this.setState({
                dataList: that.state.dataList.concat([]),
                totalPage: 0,
                refreshState: this.state.dataList.length >= this.state.totalPage ? RefreshState.EmptyData : RefreshState.Idle,
            })
        });
    }
    keyExtractor = (item, index) => {
        return index.toString()
    }
    /**
     * 列表
     */
    renderItem() {
        return (
            <RefreshListView
                data={this.state.dataList}
                keyExtractor={this.keyExtractor}
                renderItem={({ item, index }) =>
                    <View style={{ margin: 10, marginBottom: 0, backgroundColor: Colors.White, borderRadius: 5, padding: 15 }}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ marginLeft: 10, width: 70 }}>
                                    <Text style={{ color: Colors.mainTab }}>{item.state == 1 ? '待审核' : item.state == 2 ? '进行中' : item.state == 3 ? '未通过' : item.state == 4 ? '已暂停' : item.state == 5 ? '已取消' : '已关闭'}</Text>
                                </View>
                                <TouchableOpacity onPress={() => {

                                }}>
                                    <Text style={{ fontSize: 16, marginLeft: 5 }}>{`${item.title}`}</Text>
                                    <Text style={{ fontSize: 13, marginLeft: 5 }}>{`赏金：${item.unitPrice}，剩余：${item.remainderCount}个`}</Text>
                                    <View style={{ marginLeft: 5, flexDirection: 'row' }}>
                                        <View style={{ flexDirection: 'row', marginTop: 5, }}>
                                            <View style={{ borderWidth: 1, borderColor: Colors.mainTab, borderRadius: 10, paddingLeft: 5, paddingRight: 5, alignItems: 'center' }}>
                                                <Text style={styles.inviteCode}>{item.rewardType == 1 ? '现金' : ''}</Text>
                                            </View>
                                            <View style={{ borderWidth: 1, marginLeft: 5, borderColor: Colors.mainTab, borderRadius: 10, paddingLeft: 5, paddingRight: 5, alignItems: 'center' }}>
                                                <Text style={styles.inviteCode}>{item.project}</Text>
                                            </View>
                                            <View style={{ borderWidth: 1, marginLeft: 5, borderColor: Colors.mainTab, borderRadius: 10, paddingLeft: 5, paddingRight: 5, alignItems: 'center' }}>
                                                <Text style={styles.inviteCode}>{item.cateId == 1 ? '下载APP' : item.cateId == 2 ? '账号注册' : item.cateId == 3 ? '认证绑卡' : '其他'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
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
        );
    }
    render() {
        return (
            <LinearGradient colors={[Colors.mainTab, Colors.White]} start={{ x: 1, y: 1 }} end={{ x: 1, y: 0.0 }} style={{ flex: 1 }}>
                <Header title="举报维权" />
                {this.renderHeaderComponent()}
                {this.renderItem()}
            </LinearGradient>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(YoTaskApeal);

const styles = StyleSheet.create({
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    sequenceTitle: { fontSize: 14, color: Colors.C11 },
    sequence: {
        flexDirection: 'row', alignItems: 'center', height: 50, width: Metrics.screenWidth, backgroundColor: Colors.LightG,
        borderBottomLeftRadius: 20, borderBottomRightRadius: 20
    },
    searchContainer: { padding: 12, borderWidth: 1, borderColor: Colors.C16, paddingTop: 8, paddingBottom: 8, borderRadius: 8, backgroundColor: Colors.White, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mobileText: { fontSize: 15, color: Colors.mainTab, fontWeight: 'bold' },
    mobileInput: { padding: 8, marginLeft: 10, borderRadius: 6, backgroundColor: Colors.C8, marginRight: 10, fontSize: 15, color: Colors.C2, flex: 1, textAlignVertical: 'center', borderWidth: 1, borderColor: Colors.C16 },
    searchIcon: { fontWeight: 'bold', color: Colors.mainTab, fontSize: 30 },
    inviteCode: { fontSize: 12, color: Colors.C16, },
});



