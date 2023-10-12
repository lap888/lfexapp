/*
 * @Author: top.brids 
 * @Date: 2019-12-01 21:55:56 
 * @Last Modified by: top.brids
 * @Last Modified time: 2020-08-28 08:34:22
 */

import React, { Component } from 'react';
import { View, Text, PermissionsAndroid, BackHandler, ToastAndroid, Platform, Modal, ImageBackground, TouchableWithoutFeedback, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Pressable } from 'react-native';
import Swiper from 'react-native-swiper';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import Icon from "react-native-vector-icons/Ionicons";
import { connect } from 'react-redux';
import {
  upgrade
} from 'rn-app-upgrade';
import Cookie from 'cross-cookie';
import { init, } from "react-native-amap-geolocation";
import { UPDATE_NOTICE_INFO, UPDATE_USER, UPDATE_NOTICE_STATUS, UPDATE_USER_LOCATION } from '../../../redux/ActionTypes';
import { Version } from '../../../config/Index';
import { Header, ReadMore } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';
import HomeRank from './rank/HomeRank';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      progress: 0,
      msgData: [],
      bannerList: [],
      profileProgressList: [],
      doTaskUrl: '',
      doTaskImage: '/Banner/e55187aa-69ce-411a-afe8-d50752f2b453.png',
      city: '加载中...',
      noticeModalVisible: true,
      propagandaList: [],
      YokaAndChongzhiList: []
    };
  }


  componentWillUnmount() {
    if (Platform.OS == "android") {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
  }

  onBackAndroid = () => {
    if (Actions.currentScene != "Index") {
      Actions.pop();
      return true;
    } else {
      let time = new Date();
      this.lastBackPressed = this.thisBackPressed;
      this.thisBackPressed = time.getTime();
      if (this.lastBackPressed && this.lastBackPressed + 2000 >= this.thisBackPressed) {
        BackHandler.exitApp();
        return false;
      }
      ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
      return true;
    }
  };

  async componentDidMount() {
    if (Platform.OS === "android") {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    }
    await init({
      ios: "0e41e0d97f0577a2e501e82a5b1895da",
      android: "e3860f856a89dbaba8be22ce78c69370"
    });
    if (Platform.OS == "android") {
      BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    this.fetchBanner(0);
    this.reloadMessage();
    this.initData();

    if (Version >= this.props.warnVersion) {
      this.fetchMessage();
      return;
    }
  }
  /**
   * 获取哟过户数据
   */
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
  /**
   * 获取系统Banner列表
   * @param {*} source 
   */
  fetchBanner(source) {
    var that = this;
    Send("api/system/banners?source=" + source, {}, 'GET').then(res => {
      if (res.code == 200) {
        that.setState({ bannerList: res.data });
      } else {
        Toast.tipBottom(res.message)
      }
    })
  }

  /**
   * 加载系统消息
   */
  reloadMessage() {
    let that = this;
    let params = {
      pageIndex: 1,
      type: 0,
    };
    Send("api/system/notices", params).then(res => {
      if (res.code == 200) {
        that.setState({
          msgData: res.data,
        })
      } else {
        that.setState({
          msgData: [],
        })
      }
    });
  }


  /**
   * 显示系统消息
   */
  renderBroadcast() {
    return (
      <TouchableOpacity onPress={() => Actions.Message({ idx: 0 })}>
        <View style={Styles.bordercast}>
          <Icon name="volume-medium" color={Colors.main} size={22} />
          {/* ios-volume-medium-sharp  volume-medium  ios-megaphone */}
          <Swiper
            style={{ marginLeft: 10 }}
            key={this.state.msgData.length}
            height={20}
            loop={true}
            removeClippedSubviews={false}
            horizontal={true}
            autoplay={true}
            autoplayTimeout={3}
            showsPagination={false}
            showsButtons={false}
          >
            {this.state.msgData.map((item, key) =>
              <Text style={{ fontSize: 14, lineHeight: 21, color: Colors.titleMainTxt }} key={key}>{item.title}</Text>
            )}
          </Swiper>
        </View>
      </TouchableOpacity>
    )
  }

  onPressSwiper = (item) => {
    if (item.type == 1) {
      let params = JSON.parse(item.params)
      Linking.openURL(params.url)
    } else if (item.type == 2) {
      let params = JSON.parse(item.params)
      Toast.tipTop('正在下载...')

      upgrade(params.url);
    } else if (item.type == 3) {
      let params = JSON.parse(item.params);
      Actions.AdH5({ url: params.url, ty: 3, title: item.title, thumbImage: item.imageUrl, bannerId: item.id });
    } else if (item.type == 4) {
      let params = JSON.parse(item.params);
      let url = params.url;
      //处理url
      let p1 = '{YoyoUserMobilePhone}';
      let p2 = '{YoyoUserID}';
      if (url.indexOf(p1) > 0) {
        url = url.replace(p1, this.props.mobile)
      }
      if (url.indexOf(p2) > 0) {
        url = url.replace(p2, this.props.userId)
      }
      Actions.AdH5({ url: url, ty: 4, title: item.title, thumbImage: item.imageUrl, bannerId: item.id });
    } else if (item.type == 5) {
      let params = JSON.parse(item.params);
      let url = params.url;
      Cookie.get('token')
        .then(value => {
          let token = value == null || value == '' ? '' : value;
          Actions.AdReward({ url: url, ty: 5, title: item.title, thumbImage: item.imageUrl, bannerId: item.id, token: token });
        });
    } else if (item.type == 6) {
      let params = JSON.parse(item.params);
      Actions.AdH5({ url: params.url, ty: 6, title: item.title, thumbImage: item.imageUrl, bannerId: item.id });
    } else {
      Actions.AdDetail({ info: item.params, title: item.title, thumbImage: item.imageUrl, bannerId: item.id });
    }
  }
  /**
   * 渲染轮播图
   */
  renderSwiper() {
    return (
      <View style={Styles.wiper}>
        <Swiper
          key={this.state.bannerList.length}
          horizontal={true}
          loop={true}
          autoplay={true}
          autoplayTimeout={16}
          removeClippedSubviews={false}
          paginationStyle={{ bottom: 5 }}
          showsButtons={false}
          activeDotStyle={{ width: 15, height: 3, backgroundColor: Colors.White, borderRadius: 1 }}
          dotStyle={{ width: 15, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }}
        >
          {this.state.bannerList.map(item =>
            <TouchableWithoutFeedback key={item['id'].toString()} onPress={() => this.onPressSwiper(item)}>
              <Image source={{ uri: item['imageUrl'] }} style={Styles.banner} />
            </TouchableWithoutFeedback>
          )}
        </Swiper>
      </View >
    )
  }

  /**
   * 获取系统公告
   */
  fetchMessage() {
    let that = this;
    Send("api/system/OneNotice", {}, 'get').then(res => {
      if (res.code == 200) {
        that.props.updateNoticeInfo(res.data);
      }
    });
  }
  /**
   * 渲染系统公告Modal
   */
  renderNoticeModal() {
    return (
      <Modal animationType='slide' transparent visible={!this.props.isReaded && this.state.noticeModalVisible} onRequestClose={() => { }}>
        <View style={{ flex: 1, backgroundColor: "black", opacity: 0.3 }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 280, height: 350, borderRadius: 10, backgroundColor: '#FFFFFF' }}>
            <View style={{ marginTop: -35, width: 70, height: 70, borderRadius: 35, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
              <Image source={require('../../images/lfex_logo.png')} style={{ width: 60, height: 60, borderRadius: 30 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 10, paddingLeft: 20, paddingRight: 20 }}>
              <Text style={{ textAlign: 'center', fontSize: 16, color: Colors.mainTab, fontWeight: 'bold' }}>{this.props.title}</Text>
              <Text style={{ fontSize: 16, marginTop: 6, }}>{this.props.content}</Text>
            </ScrollView>
            <Pressable onPress={() => this.setState({ noticeModalVisible: false })}>
              <LinearGradient colors={[Colors.mainTab, Colors.LightG]} start={{ x: 0, y: 0 }} end={{ x: 1.5, y: 0 }} style={{ paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderBottomRightRadius: 10, borderBottomLeftRadius: 10 }}>
                  <Text style={{ fontSize: 14, color: Colors.C8 }}>我知道了</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    )
  }

  /**
   * 排行榜
   */
  renderHomeRank = () => {
    return ( 
      <HomeRank /> 
    )
  }

  onLeftPress(route) {
    if (!this.props.logged) {
      Actions.push("Login");
      return;
    }
    Actions.push(route);
  }

  render() {
    return (
      <View style={Styles.container}>
        <Header 
          onLeftPress={() => { this.onLeftPress('PlayScreen') }}
          leftText={`Login`}
          leftStyle={{color:Colors.mainTab}}
          leftImageHttpUrl={this.props.avatar == undefined ? 'asdfasdf' : this.props.avatar}
          statusBarBackgroundColor={Colors.White}
          titleStyle={{ fontSize: 14, color: Colors.titleMainTxt }}
          backgroundColor={Colors.White}
          title={`LF Global Blockchain Exchange`} />
        {this.renderSwiper()}
        {this.renderBroadcast()}
        {this.renderHomeRank()}
        {this.renderNoticeModal()}
      </View>
    );
  }
}
const mapStateToProps = state => ({
  logged: state.user.logged,
  userId: state.user.id,
  mobile: state.user.mobile,
  level: state.user.level,
  candyH: state.user.candyH || 0,
  candyP: state.user.candyP,
  candyNum: state.user.candyNum,
  location: state.user.location,
  warnVersion: state.router.warnVersion,
  isReaded: state.notice.isReaded,
  id: state.notice.id,
  uuid: state.user.uuid,
  isDoTask: state.user.isDoTask,
  dayNum: state.user.dayNum,
  title: state.notice.title,
  avatar: state.user.avatarUrl,
  content: state.notice.content,
  userBalanceNormal: state.user.userBalanceNormal,
  userBalanceLock: state.user.userBalanceLock
});

const mapDispatchToProps = dispatch => ({
  updateNoticeInfo: ({ id, title, content }) => dispatch({ type: UPDATE_NOTICE_INFO, payload: { id, title, content } }),
  updateNoticeStatus: () => dispatch({ type: UPDATE_NOTICE_STATUS }),
  updateUserLocatin: (location) => dispatch({ type: UPDATE_USER_LOCATION, payload: { location } }),
  updateUserInfo: (userInfo) => dispatch({ type: UPDATE_USER, payload: { userInfo } })

});
export default connect(mapStateToProps, mapDispatchToProps)(Home);
const Styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  wiper: { height: 160, overflow: "hidden", margin: 5, borderRadius: 6 },
  banner: { height: '100%', width: '100%' },
  bordercast: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 10, 
    paddingVertical: 8, 
    overflow: "hidden", 
    borderBottomColor: Colors.titleMain, 
    borderBottomWidth: 10 
  },

});
