/*
 * @Author: top.brids 
 * @Date: 2019-12-01 21:55:56 
 * @Last Modified by: top.brids
 * @Last Modified time: 2020-08-27 22:04:16
 */

import React, { Component } from 'react';
import { View, Text, PermissionsAndroid, BackHandler, ToastAndroid, Platform, Modal, ImageBackground, TouchableWithoutFeedback, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import Swiper from 'react-native-swiper';
import { Card, CardItem, Body } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { BoxShadow } from 'react-native-shadow';
import { connect } from 'react-redux';
import {
  upgrade
} from 'rn-app-upgrade';
import Cookie from 'cross-cookie';
import { init, Geolocation, setLocatingWithReGeocode } from "react-native-amap-geolocation";
import { UPDATE_NOTICE_INFO, UPDATE_USER, UPDATE_NOTICE_STATUS, UPDATE_USER_LOCATION } from '../../../redux/ActionTypes';
import { Version } from '../../../config/Index';
import { Header, ReadMore } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import MathFloat from '../../../utils/MathFloat';
import { HOME_OPTIONS, HOME_OPTIONS2, HOME_OPTIONS3, PROFILE_BAR } from '../../../config/Constants';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

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
    this.fetchAd(2);
    this.fetchYoKa(99);
    this.fetchTodayTask(3);
    this.reloadMessage();
    this.initData();
    if (Platform.OS == "android") {
      Geolocation.getCurrentPosition(
        position => {
          this.props.updateUserLocatin(position.location);
          this.setState({ city: position.location.city + position.location.district });
        },
        error => {
          console.log('error', error)
        }
      );
    } else {
      Geolocation.getCurrentPosition(
        position => {
          let latitude = position.location.latitude.toFixed(6);
          let longitude = position.location.longitude.toFixed(6);
          let lUrl = `https://restapi.amap.com/v3/geocode/regeo?output=json&location=${longitude},${latitude}&key=a4012f914b81a86e10f859e75f5e59aa&radius=1000&extensions=base`;
          // 逆向地理位置信息获取
          fetch(lUrl)
            .then(renderReverseText => {
              return renderReverseText.json();
            })
            .then(renderReverse => {
              if (renderReverse && renderReverse['status'] == 1) {
                let addressComponent = renderReverse['regeocode']['addressComponent'];
                let province = addressComponent['province'];
                let city = addressComponent['city'];
                let district = addressComponent['district']
                let cityCode = addressComponent['citycode'];
                let adCode = addressComponent['adcode'];
                let nextLocation = { latitude, longitude, province, city, cityCode, district, adCode };
                this.props.updateUserLocatin(nextLocation);
                this.setState({ city: nextLocation.city + nextLocation.district });
              }
            })
            .catch(error => console.log(error));
        },
        error => {
          console.log('error', error)
        }
      );
    }
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
        // Toast.show({
        //   text: res.message,
        //   textStyle: { color: '#FFFFFF', textAlign: 'center' },
        //   position: "bottom",
        //   duration: 2000
        // });
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
        // Toast.show({
        //   text: res.message,
        //   textStyle: { color: '#FFFFFF', textAlign: 'center' },
        //   position: "bottom",
        //   duration: 2000
        // });
      }
    })
  }
  fetchAd(source) {
    var that = this;
    Send("api/system/banners?source=" + source, {}, 'GET').then(res => {
      if (res.code == 200) {
        that.setState({ propagandaList: res.data });
      } else {
        Toast.tipBottom(res.message)
        // Toast.show({
        //   text: res.message,
        //   textStyle: { color: '#FFFFFF', textAlign: 'center' },
        //   position: "bottom",
        //   duration: 2000
        // });
      }
    })
  }

  fetchYoKa(source) {
    var that = this;
    Send("api/system/banners?source=" + source, {}, 'GET').then(res => {
      if (res.code == 200) {
        that.setState({ YokaAndChongzhiList: res.data });
      } else {
        Toast.tipBottom(res.message)
        // Toast.show({
        //   text: res.message,
        //   textStyle: { color: '#FFFFFF', textAlign: 'center' },
        //   position: "bottom",
        //   duration: 2000
        // });
      }
    })
  }
  fetchTodayTask(source) {
    var that = this;
    Send("api/system/TodayTask?source=" + source, {}, 'GET').then(res => {
      if (res.code == 200) {
        that.setState({ doTaskImage: res.data.imageUrl, doTaskUrl: res.data.params });
      } else {
        Toast.tipBottom(res.message)
        // Toast.show({
        //   text: res.message,
        //   textStyle: { color: '#FFFFFF', textAlign: 'center' },
        //   position: "bottom",
        //   duration: 2000
        // });
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
   * Options跳转事件
   * @param {*} route 
   */
  onOptionPress(route) {
    if (!this.props.logged) {
      Actions.push("Login");
      return;
    }

    if (route == 'YouKa') {
      this.state.YokaAndChongzhiList.map((v) => {
        if (v.id == 1) {
          this.onPressAd(v);
        }
      });
    } else {
      Actions.push(route);
    }
  }

  onOptionPress2(route) {
    if (!this.props.logged) {
      Actions.push("Login");
      return;
    }

    if (route == 'PinDuoduoShop') {
      this.state.YokaAndChongzhiList.map((item) => {
        if (item.id == 4) {
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
          Cookie.get('token')
            .then(value => {
              let token = value == null || value == '' ? '' : value;
              Actions.AdReward({ url: url, ty: 5, title: item.title, thumbImage: item.imageUrl, bannerId: item.id, token: token });
            });
        }
      });
    } else if (route == 'GoToReward') {
      this.state.YokaAndChongzhiList.map((item) => {
        if (item.id == 3) {
          let params = JSON.parse(item.params);
          let url = params.url;
          Cookie.get('token')
            .then(value => {
              let token = value == null || value == '' ? '' : value;
              Actions.AdReward({ url: url, ty: 5, title: item.title, thumbImage: item.imageUrl, bannerId: item.id, token: token });
            });
        }
      });
    }
    else if (route == 'TaoBaoShop') {
      this.state.YokaAndChongzhiList.map((item) => {
        if (item.id == 5) {
          let params = JSON.parse(item.params);
          let url = params.url;
          Cookie.get('token')
            .then(value => {
              let token = value == null || value == '' ? '' : value;
              Actions.AdReward({ url: url, ty: 5, title: item.title, thumbImage: item.imageUrl, bannerId: item.id, token: token });
            });
        }
      });
    } else if (route == 'PushUserBang') {
      this.state.YokaAndChongzhiList.map((item) => {
        if (item.id == 6) {
          let params = JSON.parse(item.params);
          let url = params.url;
          Cookie.get('token')
            .then(value => {
              let token = value == null || value == '' ? '' : value;
              let _token = encodeURIComponent(token)
              Actions.AdReward({ url: `${url}?token=${_token}`, ty: 5, title: item.title, thumbImage: item.imageUrl, bannerId: item.id, token: token });
            });
        }
      });
    } else {
      Actions.push(route);
    }
  }

  /**
   * 跳转广告
   */
  onPressAd(item) {
    if (!this.props.logged) {
      Actions.push("Login");
      return;
    }
    if (item.type == 1) {
      let params = JSON.parse(item.params)
      Linking.openURL(params.url)
    } else if (item.type == 2) {
      let params = JSON.parse(item.params)
      Toast.tipTop('正在下载...')
      // Toast.show({
      //   text: '正在下载...',
      //   textStyle: { color: '#FFFFFF', textAlign: 'center' },
      //   position: "top",
      //   duration: 2000
      // });
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
    } else if (item.type == 6) {
      let params = JSON.parse(item.params);
      Actions.AdH5({ url: params.url, ty: 6, title: item.title, thumbImage: item.imageUrl, bannerId: item.id });
    } else {
      Actions.AdDetail({ info: item.params, title: item.title, thumbImage: item.imageUrl, bannerId: item.id });
    }
  }
  /**
   * 开始任务
   */
  doTask = () => {
    if (this.props.logged) {
      // if (this.props.isDoTask !== 0) {
      //   Toast.show({
      //     text: '今日任务已完成',
      //     textStyle: { color: '#FFFFFF', textAlign: 'center' },
      //     position: "top",
      //     duration: 2000
      //   });
      //   return;
      // }
      let paramsInfo = JSON.parse(this.state.doTaskUrl)
      if (paramsInfo.id == 0) {
        Actions.HomeH5({ gUrl: paramsInfo.url, id: this.props.uuid, taskType: 'doTask', isDoTask: this.props.isDoTask });
      } else {
        Send(`api/Game/GenAuthSdwUrl?sdwId=${paramsInfo.id}`, {}, 'get').then(res => {
          if (res.code == 200) {
            Actions.HomeH5({ gUrl: res.data, id: this.props.uuid, taskType: 'doTask', isDoTask: this.props.isDoTask, ty: 'game', sdwId: paramsInfo.id });
          }
        });
      }
    } else {
      Actions.push('Login')
    }
  }

  descTask = () => {
    Send(`api/system/CopyWriting?type=do_task_rule`, {}, 'get').then(res => {
      Actions.push('CommonRules', { title: '任务说明', rules: res.data });
    });
  }
  imageAdvert = () => {
    if (this.props.logged) {
      let paramsInfo = JSON.parse(this.state.doTaskUrl)
      if (paramsInfo.id == 0) {
        Actions.HomeH5({ gUrl: paramsInfo.url, id: this.props.uuid, taskType: 'doTask', isDoTask: this.props.isDoTask });
      } else {
        Send(`api/Game/GenAuthSdwUrl?sdwId=${paramsInfo.id}`, {}, 'get').then(res => {
          if (res.code == 200) {
            Actions.HomeH5({ gUrl: res.data, id: this.props.uuid, taskType: 'doTask', isDoTask: this.props.isDoTask, ty: 'game', sdwId: paramsInfo.id });
          }
        });
      }
    } else {
      Actions.push('Login')
    }
  }
  /**
   * 显示系统消息
   */
  renderBroadcast() {
    return (
      <TouchableOpacity onPress={() => Actions.Message({ idx: 0 })}>
        <LinearGradient colors={[Colors.mainTab, '#f0d9b0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={Styles.bordercast}>
          <Icon name="md-bonfire" color="#ffffff" size={22} />
          <Swiper
            style={{ marginLeft: 10 }}
            key={this.state.msgData.length}
            height={20}
            loop={true}
            removeClippedSubviews={false}
            horizontal={true}
            autoplay={true}
            autoplayTimeout={20}
            showsPagination={false}
            showsButtons={false}
          >
            {this.state.msgData.map((item, key) =>
              <Text style={{ fontSize: 14, lineHeight: 21, color: '#ffffff' }} key={key}>{item.title}</Text>
            )}
          </Swiper>
        </LinearGradient>
      </TouchableOpacity>
    )
  }
  descAd = () => {
    let rules = [
      { key: '0', title: `如何上架自己广告`, text: `上架自己广告 需要和公司联系 公司即可将您需要的广告上架到广告栏 说明:上架广告需要支付一定费用，收费标准:\r\n上架一天时间需要支付1000￥「广告费用支持全支付 抵扣价 按当日交易大厅最高价溢价0.5元抵扣」\r\n如:交易大厅今日最高价为3元，则上架广告抵扣价为3.5元\r\nAPP内浏览广告不计次数,APP外，每用户浏览增加1阅读「数据追踪可统计」` },
      {
        key: '1', title: `广告类型`, text: `广告类型分三种\r\n1.说明图片+文字说明+App下载链接类型，该类型广告，用户点击说明图就会下载您提供链接的App\r\n2.说明图片+文字说明+文案超链接，该类型广告，用户点击说明图就会跳转到您提供文案超链接内容`
      }
    ];
    Actions.push('CommonRules', { title: '广告说明', rules });
  }

  renderAd() {
    return (
      <TouchableOpacity onPress={() => this.descAd()}>
        <LinearGradient colors={[Colors.mainTab, '#f0d9b0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={Styles.bordercast}>
          <Icon name="md-wallet" color="#ffffff" size={22} />
          <Text style={{ fontSize: 14, lineHeight: 21, color: '#ffffff', marginLeft: 10 }}>广告-分享赚果皮</Text>
        </LinearGradient>

      </TouchableOpacity>
    )
  }
  /**
   * 游戏插图
   */
  illustration(imgs) {
    if (imgs != undefined) {
      return (
        imgs.map((item) =>
          <View key={item['id'].toString()} style={{ flexDirection: 'column', width: 100, margin: 5, }}>
            <TouchableOpacity onPress={() => { this.onPressAd(item) }}>
              <Image
                source={{ uri: item['imageUrl'] }}
                style={{ height: 160, width: 100, borderRadius: 10, resizeMode: 'stretch', marginBottom: 5 }}
              />
            </TouchableOpacity>
            <ReadMore
              numberOfLines={1}
            >
              <Text style={{ fontSize: 14, textAlign: 'left', color: 'gray' }}>
                {item.title}
              </Text>
            </ReadMore>
          </View>
        )
      )
    }
    return <View />
  }
  renderAdContent() {
    return (
      <Card>
        <CardItem>
          <Body>
            <ScrollView horizontal={true}>
              <View style={{ flex: 1, flexDirection: "row" }}>
                {this.illustration(this.state.propagandaList)}
              </View>
            </ScrollView>
          </Body>
        </CardItem>
        <CardItem footer>
        </CardItem>
      </Card>
    );
  }
  onPressSwiper = (item) => {
    if (item.type == 1) {
      let params = JSON.parse(item.params)
      Linking.openURL(params.url)
    } else if (item.type == 2) {
      let params = JSON.parse(item.params)
      Toast.tipTop('正在下载...')
      // Toast.show({
      //   text: '正在下载...',
      //   textStyle: { color: '#FFFFFF', textAlign: 'center' },
      //   position: "top",
      //   duration: 2000
      // });
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
          dotStyle={{  width: 15, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }}
        >
          {this.state.bannerList.map(item =>
            <TouchableWithoutFeedback key={item['id'].toString()} onPress={() => this.onPressSwiper(item)}>
              <Image
                source={{ uri: item['imageUrl'] }}
                style={Styles.banner}
              />
            </TouchableWithoutFeedback>
          )}
        </Swiper>
      </View >
    )
  }
  /**
   * 渲染功能组件区
   */
  renderOptions() {
    return (
      <View style={Styles.options}>
        {HOME_OPTIONS.map(item => {
          let { key, name, route, icon } = item;
          return (
            <TouchableOpacity key={key} style={Styles.optionTouch} onPress={() => this.onOptionPress(route)}>
              <View style={Styles.optionItem}>
                {route == 'College' ?
                  <Image source={require('../../images/mine/xinshouzhinan.png')} style={{ width: 36, height: 36 }} /> :
                  route == 'Task' ?
                    <Image source={require('../../images/mine/renwushangdian.png')} style={{ width: 36, height: 36 }} /> :
                    route == 'TelphoneRecharge' ?
                      <Image source={require('../../images/mine/huafeichongzhi.png')} style={{ width: 36, height: 36 }} /> :
                      route == 'YouKa' ?
                        <Image source={require('../../images/mine/yijianjiayou.png')} style={{ width: 36, height: 36 }} /> :
                        route == "PushUserBang" ?
                          <Image source={require('../../images/mine/laxin.png')} style={{ width: 36, height: 36 }} /> :
                          route == "AcquisitionRanking" ?
                            <Image source={require('../../images/mine/laxin.png')} style={{ width: 36, height: 36 }} /> :
                          <FontAwesome name={icon} color={Colors.mainTab} size={28} />
                }
                <Text style={Styles.optionTitle}>{name}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }
  /**
   * 
   */
  renderOptions2() {
    return (
      <View style={Styles.options}>
        {HOME_OPTIONS2.map(item => {
          let { key, name, route, icon } = item;
          return (
            <TouchableOpacity key={key} style={Styles.optionTouch} onPress={() => this.onOptionPress2(route)}>
              <View style={Styles.optionItem}>
                {route == 'PinDuoduoShop' ?
                  <Image source={require('../../images/mine/pinduodu_2.png')} style={{ width: 36, height: 36 }} />
                  :
                  route == 'TaoBaoShop' ?
                    <Image source={require('../../images/mine/taobao.png')} style={{ width: 36, height: 36 }} />
                    :
                    route == 'GoToReward' ?
                      <Image source={require('../../images/mine/yoyochoujiang.png')} style={{ width: 36, height: 36 }} /> :
                      route == 'PushUserBang' ?
                        <Image source={require('../../images/mine/xingyunduobao.png')} style={{ width: 36, height: 36 }} /> :
                        route == 'BuyCandyBang' ?
                          <Image source={require('../../images/mine/fenxiangpaihang.png')} style={{ width: 36, height: 36 }} /> :
                          route == 'Otc' ?
                            <Image source={require('../../images/mine/jiaoyi.png')} style={{ width: 36, height: 36 }} /> :
                          <FontAwesome name={icon} color={Colors.mainTab} size={28} />
                }
                <Text style={Styles.optionTitle}>{name}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }
  /**
   * 渲染任务说明
   */
  renderTask() {
    const shadowOpt = {
      height: 44,
      width: Metrics.screenWidth / 2 - 70,
      color: Colors.C16,
      border: 4,
      radius: 6,
      opacity: 0.8,
      x: 0,
      y: 0,
      style: Styles.transactionContainer
    }
    const shadowOpt2 = {
      height: 34,
      width: Metrics.screenWidth / 2 - 70,
      color: Colors.C16,
      border: 2,
      radius: 6,
      opacity: 0.8,
      x: 0,
      y: 0,
      style: Styles.transactionContainer
    }
    return (
      <View style={Styles.task}>
        <View style={{ width: (Metrics.screenWidth) / 2, height: (Metrics.screenWidth) / 2 / 1.28, overflow: 'hidden' }} >
          <ImageBackground style={Styles.taskGif} source={{ uri: this.state.doTaskImage }} >
            <TouchableOpacity onPress={() => this.descTask()}>
              <LinearGradient colors={['#fdf7e1', Colors.mainTab]} start={{ x: -0.3, y: 0 }} end={{ x: 1, y: 0 }} style={Styles.cdtPrompt}>
                <Text style={Styles.yieldInfoText}>说明</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1}} onPress={this.imageAdvert}/>
          </ImageBackground>
        </View>
        <View style={{ marginLeft: 20, marginTop: 10, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => Actions.jump('DayDoTask')}>
            <Image style={{height: 40, width: 115, marginTop: 5}} source={require('../../images/goDoTask1.png')}/>
          </TouchableOpacity>
        </View>
      </View >
    )
  }
  /**
   * 渲染任务产量信息
   */
  renderYield() {
    return (
      <View style={Styles.yield}>
        <Text style={Styles.yieldText}>{`今日已产出 `}</Text>
        <Text style={[Styles.yieldText, { fontSize: 16, width: "40%" }]}>{this.props.dayNum.toFixed(2)}</Text>
      </View>
    )
  }
  /**
     * 渲染用户收益
     */
  renderProfile() {
    return (
      <View style={Styles.profile}>
        {PROFILE_BAR.map(item => {
          let { key, title, router } = item;
          let value = (this.props[key] == 'undefined' || this.props[key] == null) ? 0 : this.props[key];
          if (key === 'candyH') {
            value = value.toFixed(2);
          } else if (key === 'candyP' || key === 'candyNum') {
            value = value.toFixed(2);
          } else if (key === 'balance') {
            value = MathFloat.floor(this.props.userBalanceNormal, 2) + MathFloat.floor(this.props.userBalanceLock, 2);
            value = value.toFixed(2);
          } else {
            value = '¥' + MathFloat.floor(value, 2);
          }
          return (
            <TouchableOpacity key={key} onPress={() => {
              Actions.push(this.props.logged ? router : 'Login')
            }}>
              <View style={Styles.profileItem}>
                <Text style={[Styles.profileText]}>{value}</Text>
                <Text style={Styles.profileTitle}>{title}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
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
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={() => this.setState({ noticeModalVisible: false })}>
                <View style={{ marginTop: 6, height: 30, width: 100, marginRight: 5, borderRadius: 10, backgroundColor: Colors.mainTab, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: Colors.C8 }}>关闭</Text>
                </View>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={() => this.props.updateNoticeStatus()}>
                <View style={{ marginTop: 6, height: 30, width: 100, marginLeft: 5, borderRadius: 10, backgroundColor: Colors.C16, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: Colors.White }}>不再提示</Text>
                </View>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </Modal>
    )
  }
  descShop = () => {
    let rules = [
      { key: '0', title: `备注`, text: `今日推荐为对接平台第三步，社群电商做基础实验，当前没有开放，具体开放时间，详见通知！` }
    ];
    Actions.push('CommonRules', { title: '今日推荐说明', rules });
  }
  renderShop() {
    return (
      <TouchableOpacity onPress={() => this.descShop()}>
        <LinearGradient colors={[Colors.mainTab, '#f0d9b0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={Styles.bordercast}>
          <Icon name="logo-sass" color="#ffffff" size={22} />
          <Text style={{ fontSize: 14, lineHeight: 21, color: '#ffffff', marginLeft: 10 }}>今日推荐</Text>
        </LinearGradient>

      </TouchableOpacity>
    )
  }
  render() {
    return (
      <View style={Styles.container}>
        <Header title={`${this.state.city}`} isTabBar />
        <ScrollView>
          {this.renderSwiper()}
          {this.renderBroadcast()}
          {this.renderOptions()}
          {this.renderOptions2()}
          <View style={{ marginLeft: 2, marginRight: 2, paddingBottom: 10, marginBottom: 10, borderRadius: 5, borderColor: Colors.mainTab, borderWidth: 1 }}>
            {this.renderTask()}
            {this.renderYield()}
          </View>
          {this.renderProfile()}
          {this.renderAd()}
          {this.renderAdContent()}
          {this.renderShop()}
        </ScrollView>
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
  bordercast: { flexDirection: "row", alignItems: "center", padding: 5, paddingTop: 8, paddingBottom: 8, marginLeft: 5, marginRight: 5, borderRadius: 6, overflow: "hidden" },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  optionTouch: { flex: 1 },
  optionItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: { marginTop: 4, fontSize: 14 },
  task: {
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  taskGif: {
    width: (Metrics.screenWidth) / 2,
    height: (Metrics.screenWidth) / 2 / 1.28,
    marginTop: 20
  },
  yield: { marginRight: 40, marginTop: 10, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  yieldText: { fontSize: 14, color: '#3c4d66' },
  yieldInfo: { padding: 6, borderRadius: 6 },
  cdtPrompt: {
    height: 25,
    width: 40,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: Colors.mainTab,
    justifyContent: "center",
    marginLeft: 5,
    marginTop: 5,
    zIndex: 2,
  },
  yieldInfoText: { fontSize: 14, color: '#6b5a2e' },
  profile: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 5
  },
  profileItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Metrics.screenWidth / 4
  },
  profileText: {
    fontSize: 14,
    color: '#3c4d66',
    includeFontPadding: false,
    textAlignVertical: 'center',
    maxWidth: 100
  },
  profileTitle: {
    marginTop: 2,
    fontSize: 14,
    color: '#54657e',
  }
});
