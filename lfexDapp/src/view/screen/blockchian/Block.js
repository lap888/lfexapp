import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Image, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BoxShadow } from 'react-native-shadow';
import Icon from "react-native-vector-icons/Ionicons";
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import ActionButton from 'react-native-action-button';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Header } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import { Send } from '../../../utils/Http';

class Block extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order: 0,
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataList: [],
      sequence: [],
      proName: '',
      searchText: "",
    };
  }

  componentDidMount() {
    this.onHeaderRefresh();
  }

  /**
   * 进入交易规则界面
   */
  onRightPress() {
    Send(`api/system/CopyWriting?type=yobang_rule`, {}, 'get').then(res => {
      Actions.push('CommonRules', { title: '哟帮规则', rules: res.data });
    });
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
    this.setState({ order: newOrder, pageIndex: 1 }, () => {
      this.onHeaderRefresh();
    });
  }
  /**
   * 更新检索手机号
   */
  updateSearchText() {
    Keyboard.dismiss();
    if (this.state.searchText !== this.state.proName) {
      this.setState({ searchText: this.state.proName });
      this.onHeaderRefresh()
    }
  }

  onHeaderRefresh = () => {
    this.setState({ refreshState: RefreshState.HeaderRefreshing, pageIndex: 1 }, () => {
      Send('api/YoBang/TaskList', { sort: this.state.order, keyword: this.state.searchText, pageIndex: this.state.pageIndex }).then(res => {
        if (res.code == 200) {
          this.setState({
            dataList: res.data.list,
            totalPage: res.data.total,
            refreshState: res.data.list.length < 1 ? RefreshState.EmptyData : RefreshState.Idle
          })
        } else {
          this.setState({
            dataList: [],
            totalPage: 0,
            refreshState: RefreshState.EmptyData
          })
        }
      });
    });
  }

  onFooterRefresh = () => {
    let that = this;
    that.setState({
      refreshState: RefreshState.FooterRefreshing,
      pageIndex: this.state.pageIndex + 1
    }, () => {
      Send('api/YoBang/TaskList', { sort: this.state.order, keyword: this.state.searchText, pageIndex: this.state.pageIndex }).then(res => {
        if (res.code == 200) {
          this.setState({
            dataList: that.state.dataList.concat(res.data.list),
            totalPage: res.data.total,
            refreshState: this.state.dataList.length >= this.state.totalPage ? RefreshState.EmptyData : RefreshState.Idle,
          })
        } else {
          this.setState({
            dataList: [],
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
   * 渲染统计栏目
   */
  renderHeaderComponent() {
    const shadowOpt = {
      height: 56,
      width: Metrics.screenWidth - 30,
      color: Colors.mainTab,
      border: 2,
      radius: 6,
      opacity: 0.8,
      x: 0,
      y: 0,
      style: { left: 15, marginTop: 10 }
    }
    const YoTaskTitle = [
      { key: 0, title: '全部' },
      { key: 1, title: '最新' },
      { key: 3, title: '最高' },
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
        {this.state.order === 0 &&
          <BoxShadow setting={shadowOpt}>
            <View style={styles.searchContainer}>
              <Text style={styles.mobileText}>项目名称</Text>
              <TextInput style={styles.mobileInput} placeholder="搜索任务"
                value={this.state.proName}
                onChangeText={proName => this.setState({ proName })}
                onBlur={() => this.updateSearchText()}
              />
              <TouchableOpacity onPress={() => Keyboard.dismiss()}>
                <Icon name="md-search" style={styles.searchIcon} />
              </TouchableOpacity>
            </View>
          </BoxShadow>
        }
      </View>
    )
  }
  renderPublishBar() {
    return (
      <ActionButton buttonColor="rgba(255,165,0,1)" hideShadow={true} buttonText="发悬赏" buttonTextStyle={{ fontSize: 14 }}>
        <ActionButton.Item buttonColor='#9b59b6' title="下载APP" onPress={() => !this.props.logged ? Actions.push("Login") : Actions.push('PublicYoTask', { title: '下载APP', type: 1 })}>
          <Icon name="md-download" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#3498db' title="账号注册" onPress={() => !this.props.logged ? Actions.push("Login") : Actions.push('PublicYoTask', { title: '账号注册', type: 2 })}>
          <FontAwesome name="registered" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#1abc9c' title="认证绑卡" onPress={() => !this.props.logged ? Actions.push("Login") : Actions.push('PublicYoTask', { title: '认证绑卡', type: 3 })}>
          <FontAwesome name="credit-card" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#1abc9c' title="其他" onPress={() => !this.props.logged ? Actions.push("Login") : Actions.push('PublicYoTask', { title: '其他', type: 4 })}>
          <FontAwesome name="shopping-cart" style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
    );
  }
  render() {
    return (
      <LinearGradient colors={[Colors.mainTab, Colors.White]} start={{ x: 1, y: 1 }} end={{ x: 1, y: 0.0 }} style={{ flex: 1 }}>
        <Header title="任务大厅" isTabBar={true} rightText="规则" onRightPress={this.onRightPress} />
        {this.renderHeaderComponent()}
        <RefreshListView
          data={this.state.dataList}
          keyExtractor={this.keyExtractor}
          renderItem={({ item, index }) =>
            <TouchableOpacity onPress={() => {
              Actions.push('ViewTask', { yoBangBaseTask: item })
            }} style={{ margin: 10, marginBottom: 0, backgroundColor: Colors.White, borderRadius: 5, padding: 15 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ marginLeft: 10, flexDirection: 'row' }}>
                  <Image style={{ width: 50, height: 50, borderRadius: 25 }} source={{ uri: item.userPic }} />
                  <View style={{ width: Metrics.screenWidth * 0.5 }}>
                    <Text style={{ fontSize: 15, marginLeft: 5 }}>{`${item.title}`}</Text>
                    <Text style={{ fontSize: 13, marginLeft: 5,color:Colors.mainTab }}>{`${item.finishCount}已赚，剩余${item.remainderCount}个`}</Text>
                  </View>
                </View>
                <View style={{ marginLeft: 10, width: 70 }}>
                  {item.rewardType == 1 ?
                    <Text style={{ color: Colors.mainTab }}>赏{item.unitPrice}元</Text> :
                    <Text style={{ color: Colors.mainTab }}>赏{item.unitPrice}</Text>}
                </View>
              </View>
              <View style={{ marginLeft: 5, flexDirection: 'row', width: Metrics.screenWidth * 0.7 }}>
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
        {this.renderPublishBar()}
      </LinearGradient >
    );
  }
}
const mapStateToProps = state => ({
  logged: state.user.logged,
  userId: state.user.id
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Block);
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