import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Alert, Modal, TouchableOpacity, TextInput, Keyboard, InteractionManager, Platform } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import ActionButton from 'react-native-action-button';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { BoxShadow } from 'react-native-shadow';
import Icon from "react-native-vector-icons/Ionicons";
import RefreshListView, { RefreshState } from 'react-native-refresh-list-view';
import { Header } from '../../components/Index';
import { IGNORE_TRANSATION_RULE } from '../../../redux/ActionTypes';
import { TRANSACTION_STATISTICS } from '../../../config/Constants';
import { Colors, Metrics } from '../../theme/Index';
import TransactionListItem from './TransactionListItem';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';
import Advert from '../advert/Advert';

class Otc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalObtainedBuyListVisible: false,
      modalSellVisible: false,
      // 买单Form
      amount: "",
      price: 0,
      tradePwd: "",
      transactionItem: {},
      searchText: "",
      searchTextVisible: false,
      mobile: "",
      useVoiceService: true,       // 是否开启语音服务

      lastAvgPrice: 1,       // 昨日交易均价
      lastMaxPrice: "",        // 昨日最高价

      todayAvgPrice: "",       // 今日交易均价
      todayMaxPrice: "",       // 今日最高价


      sellMaxPrice: "",         // 交易卖单价上限
      sellMinPrice: "",         // 交易卖单价下限
      sysMaxPrice: "",         // 交易单价上限
      sysMinPrice: "",         // 交易单价下限

      lastTradeAmount: "",      // 昨日交易成交单数
      todayTradeAmount: "",     // 今日交易成交单数
      todayAmount: "",           // 今日发布买单单数
      upRate: "",                 // 交易单价涨幅
      optionLoading: false,       // 交易操作状态
      canTradeCandy: 0,
      type: 'price',
      order: 'desc',
      pageIndex: 1,
      pageSize: 20,
      totalPage: 0,
      transactionList: [],
      selectBar: 'BUY',
    };
    this.cache = {
      time: (new Date()).getTime(),
      refransh: 0,
    };
  }

  componentDidMount() {
    this.getTransactionPrice();
    this.onHeaderRefresh();
    this.intervalTimer()
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }
  /**
   * 定时广告
   */
  intervalTimer = () => {
    this.timer = setInterval(() => {
      if (this.props.adInterval != 0 && typeof this.props.adInterval == 'number') {
        if ((new Date()).getTime() >= this.cache.time) {
          this.cache.time = (new Date()).getTime() + this.props.adInterval * 1000;
          this.cache.refransh = 0;
        }
      } else {
        this.cache.refransh = 0;
      }
    }, 1000)
  }

  /**
   * 获取交易均价
   */
  getTransactionPrice() {
    var that = this;
    Send(`api/Trade/GetTradeTotal?coinType=${this.props.type}`, {}, 'get').then(res => {
      if (res.code == 200) {
        let { lastAvgPrice, lastMaxPrice, sysMaxPrice, sysMinPrice, sellMinPrice, sellMaxPrice, todayAmount, todayAvgPrice, todayMaxPrice, todayTradeAmount, lastTradeAmount, upRate, canTradeCandy } = res.data;
        that.setState({ lastAvgPrice, lastMaxPrice, sysMaxPrice, sysMinPrice, sellMinPrice, sellMaxPrice, todayAmount, todayAvgPrice, todayMaxPrice, todayTradeAmount, lastTradeAmount, upRate, price: todayAvgPrice, canTradeCandy });
      } else {
        Toast.tipBottom(res.message)
      }
    });
  }
  /**
   * 进入交易规则界面
   */
  onRightPress() {
    if (!this.props.userId) {
      Actions.push("Login");
      return;
    }
    Actions.push("BusinessPage", { businessType: 2, coinType: this.props.type, title: this.props.title });
  }

  /**
     * 交易统计数据加工
     * @param {*} item 
     * @param {*} index 
     */
  getStatisticsValue(item, index) {
    if (item.constructor === Array) {
      let value = item.map(e => this.state[e.key] ? (`${this.props.title == 'bibi' ? '$' : '￥'}` + (index !== 3 ? this.state[e.key].toFixed(2) : this.state[e.key])) : '--');
      return value.join('/');
    } else {
      if (item['key'] !== "upRate") {
        return this.state[item['key']] ? (`${this.props.title == 'bibi' ? '$' : '￥'}` + this.state[item['key']]) : '-';
      } else {
        return (this.state[item['key']] * 100).toFixed(1) + "%";
      }
    }
  }
  /**
   * 下架线上买单
   */
  onPressObtained(item) {
    if (!this.props.userId) {
      Actions.push("Login");
      return;
    }    
    this.setState({ transactionItem: item, modalObtainedBuyListVisible: true });
  }
  /**
   * 出售
   * @param {*} e 
   */
  onPressSell(item) {
    if (!this.props.userId) {
      Actions.push("Login");
      return;
    }
    // 判断是否弹出交易规则
    if (!this.props.isIgnored) {
      Alert.alert(
        "交易规则",
        `1.交易开放时间为:早8:00-晚23:00
2.支付倒计时时间为60分钟 发送倒计时时间为60分钟
3.如果卖家支付宝搜索不到或无法验证付款等 直接提供打款异常截图即可
4.币币交易秒USDT到账`,
        [
          {
            text: "不再提示", onPress: () => {
              this.props.ignoreTransationRule();
              this.setState({ transactionItem: item, modalSellVisible: true });
            }
          },
          {
            text: "关闭", onPress: () => {
              this.setState({ transactionItem: item, modalSellVisible: true });
            }
          },
        ],
        { cancelable: false }
      )
      return;
    }
    this.setState({ transactionItem: item, modalSellVisible: true });
  }
  /**
   * 排序条件变更
   * @param {*} key 
   */
  onChangeSequence(key) {
    let { order, type } = this.state;
    let newType = type;
    let newOrder = order;
    if (type === key) {
      if (order === 'desc') {
        newOrder = 'asc';
      } else {
        newOrder = 'desc';
      }
    } else {
      newType = key;
      newOrder = 'desc';
    }
    this.setState({ order: newOrder, type: newType }, () => {
      this.onHeaderRefresh();
    });
  }
  /**
   * 取消下架线上买卖单
   */
  cancleObtainedBuyTransaction() {
    this.setState({ transactionItem: {}, modalObtainedBuyListVisible: false, tradePwd: "" });
  }
  /**
   * 确定下架线上买卖单
   */
  confirmObtainedBuyTransaction() {
    Keyboard.dismiss();
    let { transactionItem, tradePwd } = this.state;
    let { id } = transactionItem;

    if (tradePwd.trim() === "") {
      Toast.tipBottom('请输入交易密码');
      return;
    }
    var that = this;
    if (!that.state.optionLoading) that.setState({ optionLoading: true });
    Send(`api/Trade/CancleTrade?title=${this.props.title}&orderNum=${id}&tradePwd=${tradePwd}`, {}, 'get').then(res => {
      if (res.code == 200) {
        this.onHeaderRefresh();
        that.setState({ transactionItem: {}, modalObtainedBuyListVisible: false, tradePwd: "" });
      }
      Toast.tipBottom(res.code == 200 ? "买单下架成功" : res.message);
      // 关闭发布状态
      that.setState({ optionLoading: false });
    });
  }
  /**
   * 渲染下架买单Form表单
   */
  renderModalCancleBuyList() {
    let { modalObtainedBuyListVisible, amount, selectBar, tradePwd, optionLoading } = this.state;
    return (
      <Modal animationType='slide' visible={modalObtainedBuyListVisible} transparent onRequestClose={() => { }}>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <View style={Styles.modalBody}>
            <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={Styles.publishBuy}>{selectBar === 'SELL' ? '下架卖单' : '下架买单'}</Text>
            </View>
            <View style={[Styles.modalBodyPrice, { marginTop: 40 }]}>
              <View style={Styles.modalBodyLeft}>
                <Text style={Styles.price}>交易密码</Text>
              </View>
              <View style={Styles.modalBodyRight}>
                <View style={Styles.textInputContainer}>
                  <TextInput style={Styles.publishTextInput} secureTextEntry placeholder="请输入交易密码" placeholderTextColor={Colors.White} underlineColorAndroid="transparent" keyboardType="numeric"
                    value={tradePwd}
                    onChangeText={tradePwd => this.setState({ tradePwd })}
                    returnKeyType="done"
                    onSubmitEditing={() => this.confirmObtainedBuyTransaction()}
                  />
                </View>
              </View>
            </View>
            <View style={Styles.modalFooter}>
              <TouchableOpacity disabled={optionLoading} onPress={() => this.cancleObtainedBuyTransaction()}>
                <View style={[Styles.publishConfirm, { backgroundColor: Colors.exchangeInput }]}>
                  <Text style={Styles.publishConfirmText}>取消</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity disabled={optionLoading} onPress={() => this.confirmObtainedBuyTransaction()}>
                <View style={[Styles.publishConfirm, { backgroundColor: Colors.mainTab }]}>
                  <Text style={Styles.publishConfirmText}>{optionLoading ? '进行中...' : '确定'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={Styles.modalHeader} />
        </View>
      </Modal>
    )
  }
  /**
   * 取消出售
   */
  cancleSellTransaction() {
    this.setState({ modalSellVisible: false, transactionItem: {}, tradePwd: "" });
  }
  /**
   * 确认出售
   */
  confirmSellTransaction() {
    if (this.refs.sellTradePwd) this.refs.sellTradePwd.blur();
    let { transactionItem, tradePwd } = this.state;
    let { id, price, amount } = transactionItem;
    if (tradePwd.trim() === "") {
      Toast.tipBottom('交易密码不能为空')
      return;
    }
    var that = this;
    if (!that.state.optionLoading) that.setState({ optionLoading: true });
    if (this.state.selectBar === 'BUY') {
      const params = {
        orderNum: id,
        price,
        amount,
        tradePwd: tradePwd,
        locationX: 0,//this.props.location.latitude,
        locationY: 0,//this.props.location.longitude,
        userProvince: 0,//this.props.location.province,
        userCity: 0,//this.props.location.city,
        userArea: 0,//this.props.location.district,
        cityCode: 0,//this.props.location.cityCode,
        areaCode: 0,//this.props.location.adCode
        coinType: this.props.type,
        title: this.props.title
      };
      Send("api/Trade/DealBuy", params)
        .then(res => {
          if (res.code == 200) {
            this.onHeaderRefresh();
            let title = this.props.title == 'bibi' ? "出售成功，交易已完成，点击确定进入交易完成列表查看" : "出售成功，待买家付款，点击【确定】进入我的交易界面";
            Alert.alert(
              "交易提醒",
              title,
              [
                {
                  text: "确定", onPress: () => {
                    that.setState({ modalSellVisible: false, transactionItem: {}, tradePwd: "" }, () => {
                      this.props.title == 'bibi' ? Actions.push("BusinessPage", { businessType: 3, coinType: this.props.type, title: this.props.title }) : Actions.push("BusinessPage", { businessType: 2, coinType: this.props.type, title: this.props.title });
                    });
                  }
                },
                {
                  text: "取消", onPress: () => {
                    this.onHeaderRefresh();
                    that.setState({ modalSellVisible: false, transactionItem: {}, tradePwd: "" });
                  }
                },
              ],
              { cancelable: false }
            );
          } else {
            Toast.tipBottom(res.message)
          }
          that.setState({ optionLoading: false });
        });
    }
    if (this.state.selectBar === 'SELL') {
      const params = {
        orderNum: id,
        price,
        amount,
        tradePwd: tradePwd,
        locationX: 0,//this.props.location.latitude,
        locationY: 0,//this.props.location.longitude,
        userProvince: 0,//this.props.location.province,
        userCity: 0,//this.props.location.city,
        userArea: 0,//this.props.location.district,
        cityCode: 0,//this.props.location.cityCode,
        areaCode: 0,//this.props.location.adCode
        coinType: this.props.type,
        title: this.props.title
      };
      Send("api/Trade/ConfirmBuy", params)
        .then(res => {
          if (res.code == 200) {
            this.onHeaderRefresh();
            let title = this.props.title == 'bibi' ? "收购成功，订单已完成，点击确定进入已完成列表查看" : "收购成功，待买家付款，点击【确定】进入我的交易界面";
            Alert.alert(
              "交易提醒",
              title,
              [
                {
                  text: "确定", onPress: () => {
                    that.setState({ modalSellVisible: false, transactionItem: {}, tradePwd: "" }, () => {
                      this.props.title == 'bibi' ? Actions.push("BusinessPage", { businessType: 3, coinType: this.props.type, title: this.props.title }) : Actions.push("BusinessPage", { businessType: 2, coinType: this.props.type, title: this.props.title });
                    });
                  }
                },
                {
                  text: "取消", onPress: () => {
                    this.onHeaderRefresh();
                    that.setState({ modalSellVisible: false, transactionItem: {}, tradePwd: "" });
                  }
                },
              ],
              { cancelable: false }
            );
          } else {
            Toast.show({
              text: res.message,
              textStyle: { color: '#FFFFFF', textAlign: 'center' },
              position: "bottom",
              duration: 2000
            });
          }
          that.setState({ optionLoading: false });
        });
    }
  }

  selectBtn = (type) => {
    if (this.state.selectBar == type) {
      return;
    }
    this.setState({ selectBar: type }, () => {
      this.onHeaderRefresh()
    })
  }

  /**
   * 选择bar
   */
  selectBar() {
    return (
      <View style={{ height: 40, width: Metrics.screenWidth, backgroundColor: Colors.titleMain, flexDirection: 'row', }}>
        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.selectBtn('BUY')}>
          <Text style={this.state.selectBar === 'BUY' ? Styles.selected : Styles.select}>买单</Text>
        </TouchableOpacity>
        <View style={{ width: 1, backgroundColor: Colors.mainTab, height: 20, marginTop: 10 }} />
        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.selectBtn('SELL')}>
          <Text style={this.state.selectBar === 'SELL' ? Styles.selected : Styles.select}>卖单</Text>
        </TouchableOpacity>
      </View>
    )
  }
  /**
   * 渲染出售Form表单
   */
  renderModalSell() {
    let { modalSellVisible, tradePwd, transactionItem, optionLoading, selectBar } = this.state;
    let { id, price, amount } = transactionItem;
    let totalPrice = price * amount;
    return (
      <Modal animationType='slide' visible={modalSellVisible} transparent onRequestClose={() => { }}>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <View style={Styles.modalBody}>
            <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={Styles.publishBuy}>{selectBar === 'SELL' ? '购买' : '出售'}</Text>
              {/* <Text style={Styles.currentPrice}>{`余额：${this.props.candyNum}`}</Text> */}
            </View>
            <View style={Styles.modalBodyPrice}>
              <View style={Styles.modalBodyLeft}>
                <Text style={Styles.price}>单价</Text>
              </View>
              <View style={Styles.modalBodyRight}>
                <View style={[Styles.textInputContainer, { justifyContent: 'center' }]}>
                  <Text style={{ color: Colors.White }}>{`${this.props.title == 'bibi' ? '$' : '￥'} ${price}`}</Text>
                </View>
              </View>
            </View>
            <View style={Styles.modalBodyPrice}>
              <View style={Styles.modalBodyLeft}>
                <Text style={Styles.price}>数量</Text>
              </View>
              <View style={Styles.modalBodyRight}>
                <View style={[Styles.textInputContainer, { justifyContent: 'center' }]}>
                  <Text style={{ color: Colors.White }}>{amount}</Text>
                </View>
              </View>
            </View>
            <View style={Styles.modalBodyPrice}>
              <View style={Styles.modalBodyLeft}>
                <Text style={Styles.price}>总价</Text>
              </View>
              <View style={Styles.modalBodyRight}>
                <View style={[Styles.textInputContainer, { justifyContent: 'center' }]}>
                  <Text style={{ color: Colors.White }}>{`${this.props.title == 'bibi' ? '$' : '￥'} ${totalPrice}`}</Text>
                </View>
              </View>
            </View>
            {this.props.title == 'bibi' ?
              <View style={Styles.modalBodyPrice}>
                <View style={Styles.modalBodyLeft}>
                  <Text style={Styles.price}>折合人民币≈</Text>
                </View>
                <View style={Styles.modalBodyRight}>
                  <View style={[Styles.textInputContainer, { justifyContent: 'center', backgroundColor: Colors.exchangeInput }]}>
                    <Text style={Styles.price}>{(totalPrice * 7).toFixed(4)}</Text>
                  </View>
                </View>
              </View>
              :
              <View></View>}
            <View style={Styles.modalBodyPrice}>
              <View style={Styles.modalBodyLeft}>
                <Text style={Styles.price}>交易密码</Text>
              </View>
              <View style={Styles.modalBodyRight}>
                <View style={Styles.textInputContainer}>
                  <TextInput ref="sell_tradePwd" style={Styles.publishTextInput} secureTextEntry placeholder="请输入交易密码" placeholderTextColor={Colors.White} underlineColorAndroid="transparent" keyboardType="numeric"
                    value={tradePwd}
                    onChangeText={tradePwd => this.setState({ tradePwd })}
                    returnKeyType="done"
                    onSubmitEditing={() => this.confirmSellTransaction()}
                  />
                </View>
              </View>
            </View>
            <View style={Styles.modalFooter}>
              <TouchableOpacity disabled={optionLoading} onPress={() => this.cancleSellTransaction()}>
                <View style={[Styles.publishConfirm, { backgroundColor: Colors.exchangeInput }]}>
                  <Text style={Styles.publishConfirmText}>取消</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity disabled={optionLoading} onPress={() => this.confirmSellTransaction()}>
                <View style={[Styles.publishConfirm, { backgroundColor: Colors.mainTab }]}>
                  <Text style={Styles.publishConfirmText}>{optionLoading ? '进行中...' : '确定'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={Styles.modalHeader} />
        </View>
      </Modal>
    )
  }
  /**
   * 点击发布事件
   */
  openPublishModal = (flag) => {
    if (!this.props.userId) {
      Actions.push("Login");
      return;
    }    
    let _flag = flag == 'buy' ? 'BUY' : 'SELL';
    this.setState({ modalVisible: true, selectBar: _flag });
    // this.onHeaderRefresh();
  }
  /**
     * 买单单价变更
     * @param {*} flag 
     */
  onPriceChange(flag) {
    let { price, sysMaxPrice, sysMinPrice, amount, lastAvgPrice } = this.state;
    if (flag) {
      if (amount >= 50) {
        sysMaxPrice = sysMaxPrice * 1.3;
      }
      // 上限
      if (price >= sysMaxPrice) return;
      this.setState({ price: price + 0.01 });
    } else {
      // 下限
      if (price <= sysMinPrice) return;
      this.setState({ price: price - 0.01 });
    }
  }
  /**
   * 获取发布买单总额
   */
  getBuyLumpSum(flag) {

    let { amount, price } = this.state;
    if (amount.trim() === "" || price === 0 || !amount || !price) {
      return "--";
    } else {
      if (flag == '1') {
        return (amount * price).toFixed(4);
      } else {
        return (amount * price * 7).toFixed(4);
      }
    }
  }
  /**
   * 取消发布买单订单
   */
  canclePublishBuyTransaction() {
    this.setState({ modalVisible: false, amount: "", price: this.state.todayAvgPrice, tradePwd: "" });
    this.onHeaderRefresh();
  }
  /**
   * 确定发布买单订单
   */
  confirmPublishBuyTransaction() {
    Keyboard.dismiss();
    let { sysMinPrice, sysMaxPrice, lastAvgPrice, todayAvgPrice } = this.state;
    let { amount, price, tradePwd } = this.state;
    if (!(amount > 0) ||
      price == 0 ||
      tradePwd.trim() == ""
    ) {
      Toast.tipBottom('买单信息不能为空');
      return;
    }
    var that = this;
    if (!that.state.optionLoading) that.setState({ optionLoading: true });
    if (this.state.selectBar === 'SELL') {
      Send("api/Trade/StartSell", { amount, coinType: this.props.type, price, tradePwd: tradePwd, locationX: this.props.location.latitude, locationY: this.props.location.longitude, userProvince: this.props.location.province, userCity: this.props.location.city, userArea: this.props.location.district, cityCode: this.props.location.cityCode, areaCode: this.props.location.adCode }).
        then(res => {
          if (res.code == 200) {
            this.onHeaderRefresh();
            that.setState({ modalVisible: false, amount: "", price: todayAvgPrice, tradePwd: "" });
          }
          Toast.tipBottom(res.code == 200 ? "卖单发布成功" : res.message)
          // 关闭发布状态
          that.setState({ optionLoading: false });
        });
    }
    if (this.state.selectBar === 'BUY') {
      Send("api/Trade/StartBuy", { amount, title: this.props.title, coinType: this.props.type, price, tradePwd: tradePwd, locationX: this.props.location.latitude, locationY: this.props.location.longitude, userProvince: this.props.location.province, userCity: this.props.location.city, userArea: this.props.location.district, cityCode: this.props.location.cityCode, areaCode: this.props.location.adCode }).then(res => {
        if (res.code == 200) {
          this.onHeaderRefresh();
          that.setState({ modalVisible: false, amount: "", price: todayAvgPrice, tradePwd: "" });
        }
        Toast.tipBottom(res.code == 200 ? "买单发布成功" : res.message)
        // 关闭发布状态
        that.setState({ optionLoading: false });
      });
    }
  }

  /**
   * 渲染发布买单Form表单
   */
  renderModalPublishBuyList() {
    let { modalVisible, amount, selectBar, tradePwd, sysMinPrice, sysMaxPrice, sellMinPrice, sellMaxPrice, lastAvgPrice, optionLoading } = this.state;
    return (
      <Modal animationType='slide' visible={modalVisible} transparent onRequestClose={() => { }}>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <View style={Styles.modalBody}>
            <View style={{ marginTop: 30, marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={Styles.publishBuy}>{selectBar === 'SELL' ? '我要卖' : '我要买'}</Text>
            </View>
            <View style={Styles.modalBodyPrice}>
              <View style={Styles.modalBodyLeft}>
                <Text style={Styles.price}>单价</Text>
                {selectBar === 'SELL' && <Text style={Styles.price}>{`${this.props.title == 'bibi' ? '$' : '￥'}(${sellMinPrice}—${sellMaxPrice})`}</Text>}
                {selectBar === 'BUY' && <Text style={Styles.price}>{`${this.props.title == 'bibi' ? '$' : '￥'}(${sysMinPrice}—${sysMaxPrice})`}</Text>}
              </View>
              <View style={Styles.modalBodyRight}>
                <View style={Styles.textInputContainer}>
                  <TextInput
                    style={Styles.publishTextInput}
                    placeholder="请输入交易价格"
                    placeholderTextColor={Colors.White}
                    underlineColorAndroid="transparent"
                    keyboardType="numeric"
                    value={`${this.state.price}`}
                    onChangeText={price => this.setState({ price })}
                    returnKeyType="next"
                    onSubmitEditing={() => this.refs.buyAmount.focus()}
                  />
                </View>
              </View>
            </View>
            {this.state.price < this.state.lastAvgPrice
              ?
              <View style={Styles.modalBodyPrice}>
                <View style={Styles.modalBodyLeft}>
                  <Text style={Styles.price}></Text>
                </View>
                <View style={Styles.modalBodyRight}>
                  <View style={[Styles.textInputContainer, { justifyContent: 'center', backgroundColor: Colors.exchangeInput }]}>
                    <Text style={Styles.price}>温馨提示:交易单价低于昨日最均价 将降低求购订单成交率</Text>
                  </View>
                </View>
              </View>
              :
              <View></View>}
            <View style={Styles.modalBodyPrice}>
              <View style={Styles.modalBodyLeft}>
                <Text style={Styles.price}>数量</Text>
              </View>
              <View style={Styles.modalBodyRight}>
                <View style={Styles.textInputContainer}>
                  <TextInput ref="buyAmount" style={Styles.publishTextInput} placeholder="请输入交易数量" placeholderTextColor={Colors.White} underlineColorAndroid="transparent" keyboardType="numeric"
                    value={amount}
                    onChangeText={amount => this.setState({ amount })}
                    returnKeyType="next"
                    onSubmitEditing={() => this.refs.buyTradePwd.focus()}
                  />
                </View>
              </View>
            </View>
            <View style={Styles.modalBodyPrice}>
              <View style={Styles.modalBodyLeft}>
                <Text style={Styles.price}>总价{`${this.props.title == 'bibi' ? '$' : '￥'}`}</Text>
              </View>
              <View style={Styles.modalBodyRight}>
                <View style={[Styles.textInputContainer, { justifyContent: 'center' }]}>
                  <Text style={Styles.price}>{this.getBuyLumpSum('1')}</Text>
                </View>
              </View>
            </View>
            {this.props.title == 'bibi' ?
              <View style={Styles.modalBodyPrice}>
                <View style={Styles.modalBodyLeft}>
                  <Text style={Styles.price}>折合人民币≈</Text>
                </View>
                <View style={Styles.modalBodyRight}>
                  <View style={[Styles.textInputContainer, { justifyContent: 'center', backgroundColor: Colors.exchangeInput }]}>
                    <Text style={Styles.price}>{this.getBuyLumpSum('2')}</Text>
                  </View>
                </View>
              </View>
              :
              <View></View>}
            <View style={Styles.modalBodyPrice}>
              <View style={Styles.modalBodyLeft}>
                <Text style={Styles.price}>交易密码</Text>
              </View>
              <View style={Styles.modalBodyRight}>
                <View style={Styles.textInputContainer}>
                  <TextInput ref="buyTradePwd" style={Styles.publishTextInput} secureTextEntry placeholder="请输入交易密码" placeholderTextColor={Colors.White} underlineColorAndroid="transparent" keyboardType="numeric"
                    value={tradePwd}
                    onChangeText={tradePwd => this.setState({ tradePwd })}
                    returnKeyType="done"
                    onSubmitEditing={() => this.confirmPublishBuyTransaction()}
                  />
                </View>
              </View>
            </View>
            <View style={Styles.modalFooter}>
              <TouchableOpacity disabled={optionLoading} onPress={() => this.canclePublishBuyTransaction()}>
                <View style={[Styles.publishConfirm, { backgroundColor: Colors.exchangeInput }]}>
                  <Text style={Styles.publishConfirmText}>取消</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity disabled={optionLoading} onPress={() => this.confirmPublishBuyTransaction()}>
                <View style={[Styles.publishConfirm, { backgroundColor: Colors.mainTab }]}>
                  <Text style={Styles.publishConfirmText}>{optionLoading ? '进行中...' : '确定'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={Styles.modalHeader} />
        </View>
      </Modal >
    )
  }
  /**
   * 渲染发布按钮
   */
  renderPublishBar() {
    return (
      <ActionButton buttonColor="rgba(255,165,0,1)" useNativeDriver={true} hideShadow={true} buttonText="+" buttonTextStyle={{ fontSize: 24 }}>
        <ActionButton.Item buttonColor='#9b59b6' title="我要买" onPress={() => this.openPublishModal('buy')}>
          <Icon name="person-add-outline" style={Styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#3498db' title="我要卖" onPress={() => this.openPublishModal('seller')}>
          <Icon name="person-remove-outline" style={Styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
    );
  }
  /**
   * 展开、关闭手机号搜索框
   */
  onSearchTextVisibleChange() {
    this.setState({ searchTextVisible: !this.state.searchTextVisible, mobile: '', searchText: '' });
  }
  /**
     * 更新检索手机号
     */
  updateSearchText() {
    Keyboard.dismiss();
    if (this.state.searchText !== this.state.mobile) {
      this.setState({ searchText: this.state.mobile }, () => {
        this.onHeaderRefresh();
      });
    }
  }
  /**
   * 渲染 统计面板
   */
  renderHeaderComponent() {
    const TRANSACTION_SEQUENCE = [
      { key: 'price', title: '单价' },
      { key: 'amount', title: '数量' },
      // { key: 'system', title: '托管' },
    ];
    let { order, type, canTradeCandy } = this.state;
    return (
      <View >
        <View style={Styles.transactionStatistics}>
          {/* <View style={{ marginBottom: 8, width: (Metrics.screenWidth - 30), justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: Colors.C8 }}>平台可流通</Text>
            <Text style={{ marginTop: 4, fontSize: 14, color: Colors.C8 }}>{canTradeCandy}</Text>
          </View> */}
          {TRANSACTION_STATISTICS.map((item, index) =>
            item.constructor === Array ?
              <View style={Styles.statisticsItemBottom} key={index}>
                <Text style={{ fontSize: 14, color: Colors.C12 }}>{index === 0 ? "最高(昨/今)" : index === 1 ? "成交(昨/今)" : "成交(昨/今)"}</Text>
                <Text style={{ marginTop: 4, fontSize: 14, color: Colors.mainTab }}>{this.getStatisticsValue(item, index)}</Text>
              </View>
              :
              <View style={Styles.statisticsItem} key={index}>
                <Text style={{ fontSize: 14, color: Colors.C12 }}>{item['title']}</Text>
                <Text style={{ marginTop: 4, fontSize: 13, color: Colors.mainTab }}>{this.getStatisticsValue(item, index)}</Text>
              </View>
          )}
        </View>
        <View style={{ height: 5, width: Metrics.screenWidth, backgroundColor: Colors.C9 }} />
        <View style={Styles.sequence}>
          {TRANSACTION_SEQUENCE.map(item => {
            let { key, title } = item;
            let itemSelected = type === key;
            return (
              <TouchableWithoutFeedback key={key} onPress={() => this.onChangeSequence(key)}>
                <View style={Styles.sequenceItem}>
                  <Text style={[Styles.sequenceTitle, { color: itemSelected ? Colors.C0 : Colors.C11, fontSize: 16, marginRight: 5, }]}>{title}</Text>
                  <View style={{ justifyContent: 'center' }}>
                    {(itemSelected && order === 'desc') ?
                      <FontAwesome name="caret-up" color={Colors.mainTab} size={12} />
                      :
                      <FontAwesome name="caret-up" color={Colors.C10} size={12} />
                    }
                    {(itemSelected && order === 'asc') ?
                      <FontAwesome name="caret-down" color={Colors.mainTab} size={12} />
                      :
                      <FontAwesome name="caret-down" color={Colors.C10} size={12} />
                    }
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )
          })}
          <TouchableOpacity onPress={() => this.onSearchTextVisibleChange()} style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: Colors.C0 }}>支付宝号</Text>
              {this.state.searchTextVisible ?
                <FontAwesome name="caret-up" color={Colors.mainTab} size={12} />
                :
                <FontAwesome name="caret-down" color={Colors.C10} size={12} />
              }
            </View>
          </TouchableOpacity>
        </View>
        {this.state.searchTextVisible &&
          <View style={Styles.searchContainer}>
            <Text style={Styles.mobileText}>支付宝号</Text>
            <TextInput keyboardType="numeric" style={Styles.mobileInput} placeholder="请输入支付宝号"
              value={this.state.mobile}
              onChangeText={mobile => this.setState({ mobile })}
              onBlur={() => this.updateSearchText()}
            />
            <TouchableOpacity onPress={() => Keyboard.dismiss()}>
              <Icon name="md-search" style={Styles.searchIcon} />
            </TouchableOpacity>
          </View>
        }
      </View>
    )
  }

  onHeaderRefresh = () => {
    // if (this.cache.refransh > 9) {
    //   if (Platform.OS === 'android') {
    //     Advert.rewardVideo()
    //   }
    // }
    this.setState({ refreshState: RefreshState.HeaderRefreshing, pageIndex: 1 })
    let params = {
      pageIndex: 1,
      pageSize: this.state.pageSize,
      type: this.state.type,
      order: this.state.order,
      searchText: this.state.searchText,
      Sale: this.state.selectBar,
      coinType: this.props.type,
      title: this.props.title
    }
    Send('api/Trade/TradeList', params).then(res => {
      if (res.code == 200) {
        this.cache.refransh++;
        this.setState({
          transactionList: res.data,
          totalPage: res.recordCount,
          refreshState: res.data.length < 1 ? RefreshState.EmptyData : RefreshState.Idle
        })
      } else {
        this.setState({
          transactionList: [],
          totalPage: 0,
          refreshState: RefreshState.EmptyData
        })
      }
    });
  }

  onFooterRefresh = () => {
    // if (Platform.OS === 'android') {
    //   if (this.props.pullUpTimes != 0 && typeof this.props.pullUpTimes === 'number') {
    //     if (this.state.pageIndex % this.props.pullUpTimes == 0) {
    //       Advert.interstitial();
    //     }
    //   }
    // }
    let that = this;
    that.setState({
      refreshState: RefreshState.FooterRefreshing,
      pageIndex: this.state.pageIndex + 1
    }, () => {
      let params = {
        pageIndex: that.state.pageIndex,
        pageSize: that.state.pageSize,
        type: this.state.type,
        order: this.state.order,
        searchText: this.state.searchText,
        Sale: this.state.selectBar,
        coinType: this.props.type,
        title: this.props.title
      }
      Send('api/Trade/TradeList', params).then(res => {
        if (res.code == 200) {
          this.setState({
            transactionList: that.state.transactionList.concat(res.data),
            totalPage: res.recordCount,
            refreshState: this.state.transactionList.length >= this.state.totalPage ? RefreshState.EmptyData : RefreshState.Idle,
          })
        } else {
          this.setState({
            teamList: [],
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
     * 取消、出售买单
     * @param {*} item 
     */
  toOptionBuyList(item) {
    if (item['buyerUid'] === this.props.userId || item['sellerUid'] === this.props.userId) {
      // 取消
      this.onPressObtained(item);
    } else {
      // 出售
      this.onPressSell(item);
    }
  }
  /**
   * 渲染交易列表                      
   */
  renderTransaction() {
    return (
      <RefreshListView
        data={this.state.transactionList}
        keyExtractor={this.keyExtractor}
        renderItem={({ item, index }) =>
          <TransactionListItem
            index={index}
            item={item}
            userId={this.props.userId}
            type={this.state.selectBar}
            coinType={this.props.type}
            title={this.props.title}
            toOptionBuyList={this.toOptionBuyList.bind(this, item)}
          />
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
    )
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.White }}>
        <Header leftText={`${this.props.type}交易`} statusBarBackgroundColor={Colors.titleMain} leftStyle={{ color: Colors.titleMainTxt, fontSize: 18, fontWeight: 'bold', width: Metrics.screenWidth / 2 }} backgroundColor={Colors.titleMain} rightText="订单" rightStyle={{ color: Colors.titleMainTxt }} onRightPress={() => this.onRightPress()} />
        {this.selectBar()}
        {this.renderHeaderComponent()}
        {this.renderTransaction()}
        {this.renderModalCancleBuyList()}
        {this.renderModalSell()}
        {this.renderModalPublishBuyList()}
        {this.renderPublishBar()}

        {/* {this.state.selectBar === 'SELL' ? this.renderBuyBtn() : this.renderPublishBar()} */}
      </View>
    );
  }
}

const mapStateToProps = state => ({
  logged: state.user.logged,
  userId: state.user.id,
  level: state.user.level,
  location: state.user.location,
  candyNum: state.user.candyNum,
  auditState: state.user.auditState,
  isIgnored: state.rule.isIgnored,
  adInterval: state.user.adInterval,
  pullUpTimes: state.user.pullUpTimes,
});

const mapDispatchToProps = dispatch => ({
  ignoreTransationRule: () => dispatch({ type: IGNORE_TRANSATION_RULE })
});

export default connect(mapStateToProps, mapDispatchToProps)(Otc);
const Styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { backgroundColor: '#4cc7ab', padding: 5 },
  publishBar: { paddingTop: 16, paddingBottom: 16, backgroundColor: '#4cc7ab', justifyContent: 'center', alignItems: 'center', marginBottom: Metrics.PADDING_BOTTOM },
  publishText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  modalHeader: { flex: 1, opacity: 0.6, backgroundColor: '#FFFFFF' },
  price: { fontSize: 14, color: Colors.White },
  modalBody: { paddingTop: Metrics.PADDING_BOTTOM, flexDirection: "column", justifyContent: 'flex-end', backgroundColor: Colors.exchangeBg, width: Metrics.screenWidth },
  publishBuy: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  currentPrice: { color: Colors.White, marginTop: 20, fontSize: 14, },
  modalBodyPrice: { marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  modalBodyLeft: { width: Metrics.screenWidth * 0.3, alignItems: 'flex-end' },
  modalBodyRight: { width: Metrics.screenWidth * 0.7, alignItems: 'flex-start' },
  textInputContainer: { marginLeft: 10, paddingLeft: 8, width: Metrics.screenWidth * 0.7 * 0.8, height: 40, borderRadius: 6, backgroundColor: Colors.exchangeInput },
  publishTextInput: { flex: 1, color: Colors.White },
  modalFooter: { flexDirection: 'row', marginTop: 20 },
  publishConfirm: { height: 60, width: Metrics.screenWidth * 0.5, justifyContent: 'center', alignItems: 'center' },
  publishConfirmText: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
  priceLineBtn: { borderRadius: 15, marginRight: 10, backgroundColor: '#cccccc', padding: 5, paddingLeft: 10, paddingRight: 10 },
  searchContainer: { padding: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 4, backgroundColor: Colors.C8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mobileText: { fontSize: 15, color: Colors.mainTab, fontWeight: 'bold' },
  mobileInput: { padding: 8, marginLeft: 10, borderRadius: 6, backgroundColor: Colors.C8, marginRight: 10, fontSize: 15, color: Colors.exchangeInput, flex: 1, textAlignVertical: 'center', borderWidth: 1, borderColor: Colors.main },
  searchIcon: { fontWeight: 'bold', color: Colors.mainTab, fontSize: 30 },
  transactionContainer: { left: 15, padding: 2, marginBottom: 10 },
  transactionStatistics: { paddingTop: 5, marginTop: 6, paddingBottom: 10, borderRadius: 6, marginLeft: 15, marginRight: 15, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  statisticsItem: { marginBottom: 8, width: (Metrics.screenWidth - 30) / 3, justifyContent: 'center', alignItems: 'center' },
  statisticsItemBottom: { marginBottom: 8, width: (Metrics.screenWidth - 30) / 2, justifyContent: 'center', alignItems: 'center' },
  sequence: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: Colors.WhiteSmoke },
  sequenceItem: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  sequenceTitle: { fontSize: 14, color: Colors.C11 },
  dropup: { width: 9, height: 9 },
  selected: { color: Colors.mainTab, fontSize: 18, fontWeight: 'bold' },
  select: { color: Colors.C11, fontSize: 14 },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  }
});