import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';
import { TASK_LIST } from '../../../redux/ActionTypes';
import { Colors, Metrics } from '../../theme/Index';
import { EmptyComponent } from '../../components/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';
class MyTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstLoad: true,
            showFlag: false,
            clickKey: -1
        };
    }

    componentDidMount() {
        this.getTaskList();
    }

    /**
     * 获取task列表
     */
    getTaskList() {
        if (!this.props.logged) return;
        var that = this;
        Send("api/system/TaskList?type=" + 0, {}, 'get').then(res => {
            if (that.state.firstLoad) that.setState({ firstLoad: false });
            if (res.code == 200) {
                that.props.resetTaskList(res.data);
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
     * 兑换
     * @param {*} minningId 
     */
    ensureExchange(item) {
        var that = this;
        this.setState({
            showFlag: true,
            clickKey: item.minningId
        })
        Send("api/System/TaskRenew?taskId=" + item.id, {}, 'get').then(result => {
            this.setState({
                showFlag: false,
                clickKey: -1
            })
            Alert.alert(
                `${result.code == 200 ? "续期成功" : "续期失败"}`,
                `${result.code == 200 ? `恭喜您续期一个${item['minningName']}` : result.message}`,
                [
                    { text: "确定", onPress: () => that.getTaskList() },
                ],
                { onDismiss: () => { } }
            )
        })
    }
    /**
     * 兑换矿机提示
     * @param {*} item 
     */
    exchangeMining(item) {
        let { minningName, candyIn } = item;
        Alert.alert(
            "续期提醒",
            `消耗${candyIn}续期一个${minningName}`,
            [
                { text: "确定", onPress: () => this.ensureExchange(item) },
                { text: "取消", onPress: () => { } },
            ],
            { onDismiss: () => { } }
        )
    }
    /**
         * 渲染任务Item
         * @param {*} item 
         * @param {*} index 
         */
    renderTaskItem(item, index) {
        return (
            <LinearGradient colors={[item.colors, Colors.LightG]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={Styles.miningItem} >
                <View style={Styles.miningItemHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {item.source !== 1 && <Icon name="windows" color={Colors.White} size={20} type="FontAwesome" style={{ marginRight: 4 }} />}
                        <Text style={Styles.miningItemName}>{`${item.minningName}`}</Text>
                    </View>
                    <Text style={Styles.miningItemActivity}>{`果核值${item.candyH}`}</Text>
                    <Text style={Styles.miningItemActivity}>{`${item.runTime}`}</Text>
                </View>
                <View style={Styles.miningItembody}>
                    <View>
                        <Text style={Styles.miningItemGemout}>{`任务产量：${item.candyOut}个`}</Text>
                        <Text style={Styles.miningItemGemout}>{`日产量：${item.candyH}个`}</Text>
                        <Text style={Styles.miningItemTime}>{`任务生效时间：${item.beginTime} `}</Text>
                        <Text style={Styles.miningItemTime}>{`任务到期时间：${item.endTime}`}</Text>
                    </View>
                    {(item.minningId !== 0 && item.minningId !== 6 && item.minningId !== 16) &&
                        < TouchableOpacity disabled={!this.state.showFlag ? false : true} onPress={() => this.exchangeMining(item)}>
                            <View style={Styles.miningItemFooter}>
                                <Text style={Styles.miningItemExchange}>{this.state.clickKey == item.minningId ? '续期中...' : '续期'}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>
            </LinearGradient >
        )
    }
    /**
     * 空列表组件
     */
    renderEmptyComponent() {
        return (
            <EmptyComponent isLoading={this.state.firstLoad}></EmptyComponent>
        )
    }
    render() {
        return (
            <FlatList
                contentContainerStyle={{ paddingBottom: 10 }}
                data={this.props.taskList}
                renderItem={({ item, index }) => this.renderTaskItem(item, index)}
                ListEmptyComponent={() => this.renderEmptyComponent()}
                onEndReachedThreshold={0.5}
                keyExtractor={(item, index) => String(index)}
            />
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id,
    taskList: state.task.taskList
});
const mapDispatchToProps = dispatch => ({
    resetTaskList: taskList => dispatch({ type: TASK_LIST, payload: { taskList } })
});
export default connect(mapStateToProps, mapDispatchToProps)(MyTask);
const Styles = StyleSheet.create({
    miningItem: { margin: 10, marginBottom: 0, backgroundColor: '#53b488', borderRadius: 5, padding: 15 },
    miningItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    miningItemName: { fontSize: 18, color: '#ffffff' },
    miningItemActivity: { fontSize: 14, color: '#ffffff' },
    miningItembody: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
    miningItemGemin: { fontSize: 14, color: '#ffffff' },
    miningItemGemout: { marginTop: 6, fontSize: 14, color: '#ffffff' },
    miningItemTime: { marginTop: 6, fontSize: 14, color: '#ffffff', width: Metrics.screenWidth * 0.5 },
    miningItemFooter: { alignSelf: 'flex-end', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#ffffff', padding: 18, paddingTop: 10, paddingBottom: 10 },
    miningItemExchange: { fontSize: 18, color: '#ffffff' },
});