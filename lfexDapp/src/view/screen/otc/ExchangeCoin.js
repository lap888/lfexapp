
import React, { Component } from 'react';
import { View, Text, BackHandler, ToastAndroid, Platform, StyleSheet, Image, TouchableOpacity, TextInput, Modal, Keyboard } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MathFloat from '../../../utils/MathFloat';
import { Colors, Metrics } from '../../theme/Index';
import { connect } from 'react-redux';
import CoinDrawer from './draw/CoinDrawer';
import WTOrder from './draw/WTOrder';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';
import RefreshListView from 'react-native-refresh-list-view';
const redColor = Colors.exRed;
const greenColor = Colors.exGreen;

export default class ExchangeCoin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: true,
            item: this.props.item == undefined ? { name: '糖果' } : this.props.item,
            data: '',
            wtBuyData: [],
            wtSellData: [],
            newCoinData: [],
            sysMinPrice: 0,
            sysMaxPrice: 0,
            cnyPrice: '',
            amount: '',
            minAmount: 1,
            maxAmount: 20000,
            coinTitle: 'bibi',
            selectBar: 'BUY',
            modalVisible: false,
            tradePwd: '',
            optionLoading: false,
            orders: [{ "id": 0, "amount": 52, "price": 77.25519005908292, "type": 1, "step": 0.052674127229538154 }, { "id": 1, "amount": 56, "price": 85.94899817444046, "type": 1, "step": 0.05650663169608101 }, { "id": 2, "amount": 4, "price": 77.98335629005089, "type": 1, "step": 0.004628387441109072 }, { "id": 3, "amount": 2, "price": 82.19355423831931, "type": 1, "step": 0.002031395271708325 }, { "id": 4, "amount": 74, "price": 63.13401228863751, "type": 1, "step": 0.0741400053064545 }, { "id": 5, "amount": 55, "price": 79.76465078127677, "type": 2, "step": 0.05537814579865057 }, { "id": 6, "amount": 34, "price": 48.66115938835811, "type": 2, "step": 0.034537650347311974 }, { "id": 7, "amount": 91, "price": 51.28597124200021, "type": 2, "step": 0.09139984608697496 }, { "id": 8, "amount": 84, "price": 1.9755878423038498, "type": 2, "step": 0.0842190949786397 }, { "id": 9, "amount": 48, "price": 5.493288575241406, "type": 2, "step": 0.0480386454811379 }]

        };
    }

    componentDidMount() {
        // this.getTradeTotal();
        // this.getMyTradeListWt();
        // this.getNewCoinData();
        this.onHeaderRefresh();
    }

    onHeaderRefresh = () => {
        this.getTradeTotal();
        this.getMyTradeListWt();
        this.getNewCoinData();
    }

    getTradeTotal = () => {
        Send(`api/Trade/CoinTradeTotal?coinType=${this.state.item.name}`, {}, 'GET').then(res => {
            if (res.code == 200) {
                this.setState({
                    canUserCoin: res.data.canUserCoin,
                    canUserUSDT: res.data.canUserUSDT,
                    sysMinPrice: res.data.sysMinPrice,
                    sysMaxPrice: res.data.sysMaxPrice
                })
            } else {
                Toast.tipBottom(res.message)
            }
        });
    }
    getNewCoinData = () => {
        Send(`api/Coin/NewCoinData?coinType=${this.state.item.name}`, {}, 'GET').then(res => {
            if (res.code == 200) {
                this.setState({
                    wtBuyData: res.data.buyW,
                    wtSellData: res.data.sellW
                })
            } else {
                Toast.tipBottom(res.message)
            }
        });
    }
    getMyTradeListWt = () => {
        Send(`api/Trade/MyTradeListWt?coinType=${this.state.item.name}`, {}, 'GET').then(res => {
            if (res.code == 200) {
                this.setState({
                    newCoinData: res.data
                })
            } else {
                Toast.tipBottom(res.message)
            }
        });
    }
    setItem = (item) => {
        this.setState({ item: item }, () => {
            this.onHeaderRefresh();
            // this.getMyTradeListWt();
            // this.getTradeTotal();
            // this.getNewCoinData();
        })
    }
    selectBuyOrSell = (flag) => {
        this.setState({
            selectBar: flag
        })
    }
    onChangeCnyPrice = (i) => {
        this.setState({ cnyPrice: i });
    }
    onChangeAmount = (i) => {
        this.setState({ amount: i });
    }
    /**
   * 获取发布买单总额
   */
    getBuyLumpSum(flag) {
        let { amount, cnyPrice } = this.state;
        if (cnyPrice === 0 || !amount || !cnyPrice) {
            return "--";
        } else {
            if (flag == '1') {
                return (amount * cnyPrice).toFixed(4);
            } else {
                return (amount * cnyPrice * 7).toFixed(4);
            }
        }
    }
    /**
     * 取消发布买单订单
     */
    canclePublishBuyTransaction() {
        this.setState({ modalVisible: false, tradePwd: "" });
    }
    /**
    * 确定发布买单订单
    */
    confirmPublishBuyTransaction() {
        Keyboard.dismiss();
        let { amount, cnyPrice, tradePwd } = this.state;
        if (cnyPrice <= 0) {
            Toast.tipBottom('请输入单价...');
            return;
        }
        if (cnyPrice < this.state.sysMinPrice || cnyPrice > this.state.sysMaxPrice) {
            Toast.tipBottom('挂单价不在指导价区间...');
            return;
        }
        if (amount <= 0) {
            Toast.tipBottom('请输入数量...');
            return;
        }
        if (amount < this.state.minAmount || amount > this.state.maxAmount) {
            Toast.tipBottom('挂单数量不在指导价区间...');
            return;
        }
        if (tradePwd.trim() == "") {
            Toast.tipBottom('交易密码不能为空...');
            return;
        }
        var that = this;
        if (!that.state.optionLoading) that.setState({ optionLoading: true });
        if (this.state.selectBar === 'SELL') {
            Send("api/Trade/StartSell", { amount, title: 'bibi', coinType: this.state.item.name, price: cnyPrice, tradePwd: tradePwd, locationX: 0, locationY: 0, userProvince: 0, userCity: 0, userArea: 0, cityCode: 0, areaCode: 0 }).
                then(res => {
                    if (res.code == 200) {
                        this.getMyTradeListWt();
                        that.setState({ modalVisible: false, tradePwd: "" });
                    }
                    Toast.tipBottom(res.code == 200 ? "卖单发布成功" : res.message)
                    // 关闭发布状态
                    that.setState({ optionLoading: false });
                });
        }
        if (that.state.selectBar === 'BUY') {
            Send("api/Trade/StartBuy", { amount, title: 'bibi', coinType: this.state.item.name, price: cnyPrice, tradePwd: tradePwd, locationX: 0, locationY: 0, userProvince: 0, userCity: 0, userArea: 0, cityCode: 0, areaCode: 0 }).then(res => {
                if (res.code == 200) {
                    this.getMyTradeListWt();
                    that.setState({ modalVisible: false, tradePwd: "" });
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
        let { modalVisible, amount, selectBar, tradePwd, sysMinPrice, sysMaxPrice, sellMinPrice, sellMaxPrice, optionLoading } = this.state;
        return (
            <Modal animationType='slide' visible={modalVisible} transparent onRequestClose={() => { }}>
                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <View style={styles.modalBody}>
                        <View style={{ marginTop: 30, marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.publishBuy}>{selectBar === 'SELL' ? '我要卖' : '我要买'}</Text>
                        </View>
                        <View style={styles.modalBodyPrice}>
                            <View style={styles.modalBodyLeft}>
                                <Text style={styles.price}>单价</Text>
                                {selectBar === 'SELL' && <Text style={styles.price}>{`${this.state.coinTitle == 'bibi' ? '$' : '￥'}(${sysMinPrice}—${sysMaxPrice})`}</Text>}
                                {selectBar === 'BUY' && <Text style={styles.price}>{`${this.state.coinTitle == 'bibi' ? '$' : '￥'}(${sysMinPrice}—${sysMaxPrice})`}</Text>}
                            </View>
                            <View style={styles.modalBodyRight}>
                                <View style={styles.textInputContainer}>
                                    <TextInput
                                        style={styles.publishTextInput}
                                        placeholder="请输入交易价格"
                                        placeholderTextColor={Colors.White}
                                        underlineColorAndroid="transparent"
                                        keyboardType="numeric"
                                        value={`${this.state.cnyPrice}`}
                                        onChangeText={cnyPrice => this.setState({ cnyPrice })}
                                        returnKeyType="next"
                                        onSubmitEditing={() => this.refs.buyAmount.focus()}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.modalBodyPrice}>
                            <View style={styles.modalBodyLeft}>
                                <Text style={styles.price}>数量</Text>
                            </View>
                            <View style={styles.modalBodyRight}>
                                <View style={styles.textInputContainer}>
                                    <TextInput ref="buyAmount" style={styles.publishTextInput} placeholder="请输入交易数量" placeholderTextColor={Colors.White} underlineColorAndroid="transparent" keyboardType="numeric"
                                        value={amount}
                                        onChangeText={amount => this.setState({ amount })}
                                        returnKeyType="next"
                                        onSubmitEditing={() => this.refs.buyTradePwd.focus()}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.modalBodyPrice}>
                            <View style={styles.modalBodyLeft}>
                                <Text style={styles.price}>总价{`${this.state.coinTitle == 'bibi' ? '$' : '￥'}`}</Text>
                            </View>
                            <View style={styles.modalBodyRight}>
                                <View style={[styles.textInputContainer, { justifyContent: 'center' }]}>
                                    <Text style={styles.price}>{this.getBuyLumpSum('1')}</Text>
                                </View>
                            </View>
                        </View>
                        {this.state.coinTitle == 'bibi' ?
                            <View style={styles.modalBodyPrice}>
                                <View style={styles.modalBodyLeft}>
                                    <Text style={styles.price}>折合人民币≈</Text>
                                </View>
                                <View style={styles.modalBodyRight}>
                                    <View style={[styles.textInputContainer, { justifyContent: 'center', backgroundColor: Colors.exchangeInput }]}>
                                        <Text style={styles.price}>{this.getBuyLumpSum('2')}</Text>
                                    </View>
                                </View>
                            </View>
                            :
                            <View></View>}
                        <View style={styles.modalBodyPrice}>
                            <View style={styles.modalBodyLeft}>
                                <Text style={styles.price}>交易密码</Text>
                            </View>
                            <View style={styles.modalBodyRight}>
                                <View style={styles.textInputContainer}>
                                    <TextInput ref="buyTradePwd" style={styles.publishTextInput} secureTextEntry placeholder="请输入交易密码" placeholderTextColor={Colors.White} underlineColorAndroid="transparent" keyboardType="numeric"
                                        value={tradePwd}
                                        onChangeText={tradePwd => this.setState({ tradePwd })}
                                        returnKeyType="done"
                                        onSubmitEditing={() => this.confirmPublishBuyTransaction()}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity disabled={optionLoading} onPress={() => this.canclePublishBuyTransaction()}>
                                <View style={[styles.publishConfirm, { backgroundColor: Colors.exchangeInput }]}>
                                    <Text style={styles.publishConfirmText}>取消</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={optionLoading} onPress={() => this.confirmPublishBuyTransaction()}>
                                <View style={[styles.publishConfirm, { backgroundColor: Colors.mainTab }]}>
                                    <Text style={styles.publishConfirmText}>{optionLoading ? '进行中...' : '确定'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.modalHeader} />
                </View>
            </Modal >
        )
    }
    /**
   * 点击发布事件
   */
    openPublishModal = () => {
        let { amount, cnyPrice } = this.state;
        if (cnyPrice <= 0) {
            Toast.tipBottom('请输入单价...');
            return;
        }
        if (cnyPrice < this.state.sysMinPrice || cnyPrice > this.state.sysMaxPrice) {
            Toast.tipBottom('挂单价不在指导价区间...');
            return;
        }
        if (amount <= 0) {
            Toast.tipBottom('请输入数量...');
            return;
        }
        if (amount < this.state.minAmount || amount > this.state.maxAmount) {
            Toast.tipBottom('挂单数量不在指导价区间...');
            return;
        }

        this.setState({ modalVisible: true });
    }

    onPressExchangeRecord() {
        Actions.push("ExchangeRecord", { businessType: 2, coinType: this.state.item.name, title: 'bibi' });
    }

    listHeaderComponent = () => {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'row', }}>
                    {/* 求购单列 */}
                    <View style={{ flex: 1, }}>
                        <View>
                            <View style={{ flex: 1, padding: 10 }}>
                                <View style={{ height: 50, flexDirection: 'row', paddingTop: 5 }}>
                                    <TouchableOpacity activeOpacity={1} style={this.state.selectBar == 'BUY' ? styles.btn1 : styles.unBtn1} onPress={() => { this.selectBuyOrSell('BUY') }}>
                                        <Text style={{ fontSize: 14, color: `${this.state.selectBar == 'BUY' ? Colors.White : Colors.greyText}` }}>买入</Text>
                                    </TouchableOpacity>
                                    <View style={this.state.selectBar == 'BUY' ? styles.btnLeft : styles.unBtnLeft} />
                                    <View style={this.state.selectBar == 'SELL' ? styles.btnRight : styles.unBtnRight} />
                                    <TouchableOpacity activeOpacity={1} style={this.state.selectBar == 'SELL' ? styles.btn2 : styles.unBtn2} onPress={() => { this.selectBuyOrSell('SELL') }}>
                                        <Text style={{ fontSize: 14, color: `${this.state.selectBar == 'SELL' ? Colors.White : Colors.greyText}` }}>卖出</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, }}>
                                    <Text>参考价格</Text>
                                    <Text>{`${this.state.sysMinPrice}-${this.state.sysMaxPrice}`}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, borderWidth: 1, borderColor: Colors.LightGrey, paddingHorizontal: 5, borderRadius: 5, }}>
                                    <View style={{ height: 50, flex: 1 }}>
                                        <TextInput
                                            value={this.state.cnyPrice}
                                            style={styles.placeholderText}
                                            placeholder="价格"
                                            keyboardType="numeric"
                                            onChangeText={this.onChangeCnyPrice}
                                            clearButtonMode="while-editing"
                                            returnKeyType="done"
                                            onSubmitEditing={() => this.openPublishModal()} />
                                    </View>
                                    <Text style={{ color: Colors.black, fontWeight: 'bold', }}>USDT</Text>
                                </View>
                            </View>
                            <View style={{ flex: 1, padding: 10 }}>
                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, }}>
                                    <Text>数量</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, borderWidth: 1, borderColor: Colors.LightGrey, paddingHorizontal: 5, borderRadius: 5, }}>
                                    <View style={{ height: 50, flex: 1 }}>
                                        <TextInput
                                            value={this.state.amount}
                                            style={styles.placeholderText}
                                            placeholder={`数量(${this.state.minAmount}-${this.state.maxAmount})`}
                                            keyboardType="numeric"
                                            onChangeText={this.onChangeAmount}
                                            clearButtonMode="while-editing"
                                            returnKeyType="done"
                                            onSubmitEditing={() => this.openPublishModal()} />
                                    </View>
                                    <Text style={{ color: Colors.black, fontWeight: 'bold', }}>{this.state.item.name}</Text>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                    <Text>可用</Text>
                                    <Text>{`${this.state.selectBar == 'BUY' ? this.state.canUserUSDT : this.state.canUserCoin} ${this.state.selectBar == 'BUY' ? 'USDT' : this.state.item.name}`}</Text>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                                    <Text style={{ fontWeight: 'bold', }}>交易额</Text>
                                    <Text style={{ fontWeight: 'bold', }}>{`${(this.state.cnyPrice * this.state.amount).toFixed(4)} USDT`}</Text>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity style={{ height: 40, paddingHorizontal: 10, marginTop: 20, borderRadius: 20 }} onPress={this.openPublishModal}>
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: `${this.state.selectBar == 'BUY' ? Colors.exGreen : Colors.exRed}`, }}>
                                        <Text style={{ fontSize: 15, color: Colors.White, }}>{this.state.selectBar == 'BUY' ? '买 入' : '卖 出'}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}></View>
                    </View>
                    {/* 求购单列 */}
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 10, justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, }}>
                            <Text style={{ fontWeight: 'bold', }}>数量</Text>
                            <Text style={{ fontWeight: 'bold', }}>价格</Text>
                        </View>
                        {this.state.wtSellData.map(item => {
                            return (
                                <View key={item.id}>
                                    <View style={styles.jidubg}>
                                        <View style={{ flex: 1, flexDirection: 'row', width: (Metrics.screenWidth / 2 - 10), justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, }}>
                                            <Text style={{ fontWeight: 'bold', color: Colors.exRed }}>{MathFloat.floor(item.amount, 4).toFixed(4)}</Text>
                                            <Text style={{ fontWeight: 'bold', color: Colors.exRed }}>{MathFloat.floor(item.price, 4)}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.jidu, { width: (Metrics.screenWidth / 2 - 10) * item.rate, backgroundColor: Colors.exRed }]} />
                                </View>
                            );
                        })}
                        {this.state.wtBuyData.map(item => {
                            return (
                                <View key={item.id}>
                                    <View style={styles.jidubg}>
                                        <View style={{ flex: 1, flexDirection: 'row', width: (Metrics.screenWidth / 2 - 10), justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, }}>
                                            <Text style={{ fontWeight: 'bold', color: Colors.exGreen }}>{MathFloat.floor(item.amount, 4).toFixed(4)}</Text>
                                            <Text style={{ fontWeight: 'bold', color: Colors.exGreen }}>{MathFloat.floor(item.price, 4)}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.jidu, { width: (Metrics.screenWidth / 2 - 10) * item.rate, backgroundColor: Colors.exGreen }]} />
                                </View>
                            );
                        })}
                    </View>
                </View>
                <View style={{ marginTop: 10, paddingTop: Metrics.STATUSBAR_HEIGHT, height: Metrics.HEADER_HEIGHT, width: Metrics.screenWidth, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1, flexDirection: 'row', paddingLeft: 10 }} onPress={() => this.currencyDrawer.showModal()}>
                        <Text style={{ fontSize: 15, color: Colors.blakText, marginLeft: 5 }}>当前委托</Text>
                    </View>
                    <TouchableOpacity style={{ flexDirection: 'row', marginRight: 10 }} onPress={() => this.onPressExchangeRecord()}>
                        <Icon name={'ios-list-outline'} size={20} color={Colors.greyText} />
                        <Text style={{ fontSize: 15, color: Colors.greyText, marginLeft: 5 }}>交易记录</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.greyText, height: 2, marginHorizontal: 10 }}></View>
            </View>
        )
    }

    renderItem = ({ item, index }) => {
        return (
            <View key={index}>
                <View style={{ flexDirection: 'row', flex: 1, marginVertical: 10, paddingHorizontal: 15, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, color: item.trendSide == 'BUY' ? Colors.exGreen : Colors.exRed }}>{item.trendSide == 'BUY' ? '买' : '卖'}</Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={{ color: Colors.blakText, marginLeft: 5, fontWeight: 'bold', }}>{item.name}</Text>
                        <Text style={{ color: Colors.greyText, fontSize: 12, marginLeft: 5 }}>/ USDT</Text>
                    </View>
                    <Text style={{ color: Colors.greyText, fontSize: 12, marginLeft: 5 }}>{item.ctime}</Text>
                </View>
                <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                        <Text style={{ color: Colors.greyText, fontSize: 12, marginLeft: 5 }}>委托总量</Text>
                        <Text style={{ color: Colors.blakText, marginLeft: 5, fontWeight: 'bold', }}>{item.Amount} {item.name}</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: Colors.greyText, fontSize: 12, marginLeft: 5 }}>委托价格</Text>
                        <Text style={{ color: Colors.blakText, marginLeft: 5, fontWeight: 'bold', }}>{item.price} USDT</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 8, borderBottomWidth: 0.5, borderBottomColor: Colors.greyText, height: 2, marginHorizontal: 10 }}></View>
            </View>
        )
    }

    render() {
        const { data, item } = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
                <View style={{ paddingTop: Metrics.STATUSBAR_HEIGHT, height: Metrics.HEADER_HEIGHT, width: Metrics.screenWidth, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity style={{ flex: 1, flexDirection: 'row', paddingLeft: 10 }} onPress={() => this.currencyDrawer.showModal()}>
                        <AntDesign name={'menu-fold'} size={20} color={Colors.blakText} />
                        <Text style={{ fontSize: 15, color: Colors.blakText, marginLeft: 5 }}>{item.name}/USDT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginRight: 10 }} onPress={() => Actions.push('MarketScreen', { item })}>
                        <Icon name={'stats-chart'} size={20} color={Colors.blakText} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                    <RefreshListView
                        data={this.state.newCoinData}
                        keyExtractor={(item ,index) => index + 'index'}
                        renderItem={this.renderItem}
                        ListHeaderComponent={this.listHeaderComponent}
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
                {/* <ScrollView style={{ flex: 1 }}>
                    
                    <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.greyText, height: 2, marginHorizontal: 10 }}></View>
                    {this.state.newCoinData.map((v, i) => {
                        return (
                            <View key={i}>
                                <View style={{ flexDirection: 'row', flex: 1, marginVertical: 10, paddingHorizontal: 15, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 20, color: v.trendSide == 'BUY' ? Colors.exGreen : Colors.exRed }}>{v.trendSide == 'BUY' ? '买' : '卖'}</Text>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                                        <Text style={{ color: Colors.blakText, marginLeft: 5, fontWeight: 'bold', }}>{item.name}</Text>
                                        <Text style={{ color: Colors.greyText, fontSize: 12, marginLeft: 5 }}>/ USDT</Text>
                                    </View>
                                    <Text style={{ color: Colors.greyText, fontSize: 12, marginLeft: 5 }}>{v.ctime}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                                        <Text style={{ color: Colors.greyText, fontSize: 12, marginLeft: 5 }}>委托总量</Text>
                                        <Text style={{ color: Colors.blakText, marginLeft: 5, fontWeight: 'bold', }}>{v.Amount} {item.name}</Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: Colors.greyText, fontSize: 12, marginLeft: 5 }}>委托价格</Text>
                                        <Text style={{ color: Colors.blakText, marginLeft: 5, fontWeight: 'bold', }}>{v.price} USDT</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 8, borderBottomWidth: 0.5, borderBottomColor: Colors.greyText, height: 2, marginHorizontal: 10 }}></View>
                            </View>
                        );
                    })}
                </ScrollView> */}
                {this.renderModalPublishBuyList()}
                <CoinDrawer ref={cModal => this.currencyDrawer = cModal} setItem={this.setItem} />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    btn1: { height: 40, flex: 1, backgroundColor: greenColor, alignItems: 'center', justifyContent: 'center' },
    unBtn1: { height: 40, flex: 1, backgroundColor: Colors.LightGrey, alignItems: 'center', justifyContent: 'center' },
    btn2: { height: 40, flex: 1, backgroundColor: redColor, alignItems: 'center', justifyContent: 'center' },
    unBtn2: { height: 40, flex: 1, backgroundColor: Colors.LightGrey, alignItems: 'center', justifyContent: 'center' },

    btnLeft: { borderLeftWidth: 8, borderBottomWidth: 40, borderBottomColor: Colors.backgroundColor, borderLeftColor: greenColor, height: 40, backgroundColor: 'green', width: 0, },
    unBtnLeft: { borderLeftWidth: 8, borderBottomWidth: 40, borderBottomColor: Colors.backgroundColor, borderLeftColor: Colors.LightGrey, height: 40, backgroundColor: 'green', width: 0, },

    btnRight: { borderLeftWidth: 8, borderBottomWidth: 40, marginLeft: 5, borderBottomColor: redColor, borderLeftColor: Colors.backgroundColor, height: 40, backgroundColor: 'green', width: 0, },
    unBtnRight: { borderLeftWidth: 8, borderBottomWidth: 40, marginLeft: 5, borderBottomColor: Colors.LightGrey, borderLeftColor: Colors.backgroundColor, height: 40, backgroundColor: 'green', width: 0, },

    placeholderText: {
        height: 50,
        fontSize: 16,
        flex: 1,
        fontWeight: 'bold',
    },
    jidubg: {
        height: 35,
        marginBottom: 1,
    },
    jidu: {
        position: 'absolute',
        height: 35,
        backgroundColor: Colors.activeTintColor,
        opacity: 0.3,
        right: 0
    },
    modalHeader: { flex: 1, opacity: 0.6, backgroundColor: '#FFFFFF' },
    price: { fontSize: 14, color: Colors.White },
    modalBody: { paddingTop: Metrics.PADDING_BOTTOM, flexDirection: "column", justifyContent: 'flex-end', backgroundColor: Colors.exchangeBg, width: Metrics.screenWidth },
    publishBuy: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    modalBodyPrice: { marginTop: 12, flexDirection: 'row', alignItems: 'center' },
    modalBodyLeft: { width: Metrics.screenWidth * 0.3, alignItems: 'flex-end' },
    modalBodyRight: { width: Metrics.screenWidth * 0.7, alignItems: 'flex-start' },
    textInputContainer: { marginLeft: 10, paddingLeft: 8, width: Metrics.screenWidth * 0.7 * 0.8, height: 40, borderRadius: 6, backgroundColor: Colors.exchangeInput },
    publishTextInput: { flex: 1, color: Colors.White },
    modalFooter: { flexDirection: 'row', marginTop: 20 },
    publishConfirm: { height: 60, width: Metrics.screenWidth * 0.5, justifyContent: 'center', alignItems: 'center' },
    publishConfirmText: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
})

