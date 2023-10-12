import React, { Component } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, TextInput, Keyboard, Platform, Pressable
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import ImagePicker from 'react-native-image-picker';
// import { Toast } from 'native-base';
import { Header, PicturePreview } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import { Trade } from '../../../models';
import { EncryptionUsername } from '../../../utils/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

class TransactionDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            avatarSource: "",
            trdeData: {},
            tradePwd: "",
            itemId: null,
            optionLoading: false,
            modalCancleButListVisible: false,
            isImgDispalyFullScreen: false,
            isDispalyEg: false,
            paidTime: null,
            clipboardWarnText: "复制",
            picturePreviewList: [], 		// 预览图片
            picturePreviewModalVisible: false,	// 预览弹框
        };
    }
    componentDidMount() {
        this.reloadData();
        this.startInterval();
    }
    /**
     * 获取订单详情
     */
    reloadData() {
        this.setState({
            trdeData: Trade.getTradData()[this.props.tradeIdx],
        })
    }
    /**
     * 定时器
     */
    startInterval() {
        let that = this;
        this.interval = setInterval(() => {
            that.setState({});
        }, 1000);
    }

    componentWillUnmount() {
        if (this.interval) clearInterval(this.interval);
    }

    /**
     * 获取订单状态
     */
    displayPromptTxt() {
        if (this.state.trdeData.status === 2) { return "待付款" }
        if (this.state.trdeData.status === 3) { return "已付款" }
        if (this.state.trdeData.status === 5) { return "申诉中" }
    }
    /**
	 * 调起图片预览组件
	 */
    handelPreviewImage = () => {
        this.setState({ picturePreviewList: [{ uri: this.state.trdeData.alipayPic }] }, () => {
            if (!this.state.picturePreviewModalVisible) this.setState({ picturePreviewModalVisible: true });
        });
    }
    /**
     * 渲染订单Header
     */
    renderHeader() {
        return (
            <View style={Styles.header}>
                <View style={{ marginLeft: -15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Text style={[Styles.title, { color: Colors.White }]}>订单状态</Text>
                    </View>
                    <Text style={{ color: Colors.White, fontSize: 16 }}>{this.displayPromptTxt()}</Text>
                </View>
                <View style={{ marginTop: 4 }}>
                    <View style={[Styles.bcdTitleView]}>
                        <Text style={Styles.headerDtitle}>订单编号</Text>
                        <Text style={Styles.headerDtxt}>{this.state.trdeData.tradeNumber || ""}</Text>
                    </View>
                    <View style={[Styles.bcdTitleView]}>
                        <Text style={Styles.headerDtitle}>交易数量</Text>
                        <Text style={Styles.headerDtxt}>{this.state.trdeData.amount}</Text>
                    </View>
                    <View style={[Styles.bcdTitleView]}>
                        <Text style={Styles.headerDtitle}>单价</Text>
                        <Text style={Styles.headerDtxt}>{`${this.props.title == 'bibi' ? '$' : '￥'}`}{this.state.trdeData.price}</Text>
                    </View>
                    <View style={[Styles.bcdTitleView]}>
                        <Text style={Styles.headerDtitle}>总金额</Text>
                        <Text style={Styles.headerDtxt}>{`${this.props.title == 'bibi' ? '$' : '￥'}`}{this.state.trdeData.totalPrice}</Text>
                    </View>
                    <View style={[Styles.bcdTitleView]}>
                        <Text style={Styles.headerDtitle}>交易时间</Text>
                        <Text style={Styles.headerDtxt}>
                            {this.state.trdeData.dealTime ? this.state.trdeData.dealTime : "--"}
                        </Text>
                    </View>
                </View>
            </View>
        )
    }
    /**
     * 渲染卖家信息
     */
    renderSeller() {
        return this.renderOwnTage("卖方信息", { name: this.state.trdeData.sellerTrueName, tel: this.state.trdeData.sellerMobile })
    }

    /**
     * 渲染买家信息
     */
    renderBuyer() {
        return this.renderOwnTage("买方信息", { name: this.state.trdeData.buyerTrueName, tel: this.state.trdeData.buyerMobile })
    }
    /**
     * 公用部分买家、卖家
     * @param {*} title 
     * @param {*} info 
     */
    renderOwnTage(title, info) {
        return (
            <View style={Styles.body}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <View style={[Styles.verticalLine, { backgroundColor: Colors.mainTab }]} />
                    <Text style={Styles.title}>{title}</Text>
                </View>
                <View style={{ marginLeft: 12.5 }}>
                    <View style={[Styles.bcdTitleView, { marginTop: -14, alignItems: 'flex-end' }]}>
                        <Text style={Styles.bodyDtxt}>头像</Text>
                        <Image style={Styles.imgStyle}
                            source={title === "卖方信息" ? { uri: this.state.trdeData.sellerAvatarUrl } : { uri: this.state.trdeData.buyerAvatarUrl }}
                        />
                    </View>
                    <View style={Styles.bcdTitleView}>
                        <Text style={Styles.bodyDtxt}>姓名</Text>
                        <Text style={[Styles.bodyDtxt]}>{EncryptionUsername(info.name)}</Text>
                    </View>
                    <View style={Styles.bcdTitleView}>
                        <Text style={Styles.bodyDtxt}>电话</Text>
                        <Text style={Styles.bodyDtxt}>{info.tel}</Text>
                    </View>
                    {title === "卖方信息" &&
                        <View style={Styles.bcdTitleView}>
                            <Text style={Styles.bodyDtxt}>支付宝</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <TouchableOpacity onPress={() => {
                                    Clipboard.setString(this.state.trdeData.sellerAlipay);
                                    this.setState({ clipboardWarnText: "已复制" });
                                }}>
                                    <View style={{ padding: 4, borderColor: Colors.mainTab, borderWidth: 1, borderRadius: 4, marginRight: 10 }}>
                                        <Text style={[Styles.bodyDtxt, { color: Colors.mainTab }]}>{this.state.clipboardWarnText}</Text>
                                    </View>
                                </TouchableOpacity>
                                <Text style={Styles.bodyDtxt}>{this.state.trdeData.sellerAlipay ? this.state.trdeData.sellerAlipay : ""}</Text>
                            </View>
                        </View>
                    }
                    {title === "卖方信息" && this.state.trdeData.alipayPic != '' &&
                        <View style={Styles.bcdTitleView}>
                            <Text style={Styles.bodyDtxt}> </Text>
                            <View style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Pressable onPress={this.handelPreviewImage}>
                                    <Image style={{height: 120, width: 90,}} resizeMode='stretch' source={{uri: this.state.trdeData.alipayPic}} />
                                </Pressable>
                                <Text style={[Styles.bodyDtxt,{color: Colors.main, marginTop: 5}]}>收款码</Text>
                            </View>
                        </View>
                    }
                </View>
                <PicturePreview
                    data={this.state.picturePreviewList}
                    visible={this.state.picturePreviewModalVisible}
                    onClose={() => this.setState({ picturePreviewModalVisible: false })}
                />
            </View>
        )
    }
    /**
     * 上传支付截图
     */
    handleButtonPress = () => {
        const options = {
            title: '上传图片',
            cancelButtonTitle: '取消',
            takePhotoButtonTitle: Platform.OS === 'ios' ? '拍照' : null,
            chooseFromLibraryButtonTitle: '图库',
            cameraType: 'back',
            mediaType: 'photo',
            videoQuality: 'high',
            durationLimit: 10,
            maxWidth: 600,
            maxHeight: 600,
            aspectX: 2,
            aspectY: 1,
            quality: 1,
            angle: 0,
            allowsEditing: false,
            noData: false,
        };
        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                console.log('用户取消了选择图片');
            } else if (response.error) {
                console.log('ImagePicker 错误: ', response.error);
            } else {
                this.setState({ avatarSource: 'data:image/jpeg;base64,' + response.data });
            }
        });
    }
    /**
     * 显示截图示例
     */
    displayEGshot() {
        this.setState({
            isDispalyEg: true
        });
    }

    /**
     * 放大缩小截图
     */
    displayFullScreenshot() {
        this.setState({
            isImgDispalyFullScreen: true
        })
    }
    /**
     * 渲染支付截图
     */
    renderPayShot() {
        if (this.state.trdeData.status === 2 && this.state.trdeData.buyerUid === this.props.userId) {
            if (this.state.avatarSource) {
                return (
                    <View>
                        <TouchableOpacity onPress={() => { this.displayFullScreenshot() }}>
                            <Image
                                ref="img"
                                style={Styles.screenshotImg}
                                source={{ uri: this.state.avatarSource }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ position: 'absolute', top: 10, right: 0 }} onPress={() => this.setState({ avatarSource: "" })}>
                            <View style={Styles.close}>
                                <Image style={{ height: 20, width: 20 }}
                                    source={require("../../images/close.png")}
                                />

                            </View>
                        </TouchableOpacity>
                    </View>
                )
            } else {
                return (
                    <View style={[Styles.screenshotImg, { justifyContent: 'center', alignItems: 'center' }]}>
                        <FontAwesome name="image" color={Colors.mainTab} size={60} />
                    </View>
                )
            }
        }
        if (this.state.trdeData.status === 3 || this.state.trdeData.status === 5) {
            if (this.state.trdeData.pictureUrl) {
                return (
                    <TouchableOpacity onPress={() => { this.displayFullScreenshot() }}>
                        <Image
                            ref="img"
                            style={[Styles.screenshotImg, { marginTop: 4 }]}
                            source={{ uri: this.state.trdeData.pictureUrl }}
                        />
                    </TouchableOpacity>
                )
            } else {
                return (
                    <View style={[Styles.screenshotImg, { marginTop: 4, justifyContent: 'center', alignItems: 'center' }]}>
                        <Image source={require('../../images/icon_img.png')} style={{ width: 60, height: 60 }} />
                    </View>
                )

            }
        }
    }
    /**
     * 渲染支付截图示例Modal
     */
    renderScreenShotExample() {
        let { isDispalyEg } = this.state;
        return (
            <Modal animationType='slide' visible={isDispalyEg} animationType={'none'} transparent onRequestClose={() => { }}>
                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <View style={Styles.modalBody}>
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                isDispalyEg: false
                            })
                        }}>
                            <View style={{
                                marginTop: 20,
                                alignItems: "center"
                            }}>
                                <View style={{ padding: 8 }}>
                                    <Image style={{
                                        height: Metrics.screenHeight * 0.7,
                                        width: Metrics.screenWidth * 0.7,
                                        resizeMode: "contain"
                                    }}
                                        source={require("../../images/Alipay.png")}
                                    />
                                </View>
                                <Text style={{
                                    fontSize: 18,
                                    color: Colors.C6
                                }}>
                                    温馨提示
                                </Text>
                                <Text style={{
                                    color: Colors.White,
                                    fontSize: 16,
                                    marginTop: 10,
                                    width: Metrics.screenWidth * 0.8,
                                    letterSpacing: 1
                                }}>
                                    支付之前请与卖家电话联系并确认订单。请使用支付宝支付，禁止使用微信支付，支付宝支付请严格按照示例上传截图，其他截图无效。
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[Styles.modalHeader, { opacity: 1, backgroundColor: "#25252b" }]} />
                </View>
            </Modal>
        )
    }
    /**
     * 渲染支付截图
     */
    renderScreenshot() {
        return (
            <View style={Styles.body}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <View style={[Styles.verticalLine, { backgroundColor: Colors.mainTab }]} />
                    <Text style={Styles.title}>支付截图</Text>
                </View>
                <View style={{ marginTop: 16, flexDirection: 'row' }}>
                    <View style={{ width: 140, alignItems: 'center' }}>
                        {this.state.trdeData.status === 2 && this.state.trdeData.buyerUid === this.props.userId &&
                            <TouchableOpacity onPress={() => this.handleButtonPress()}>
                                <View style={Styles.uploadView}>
                                    <Text style={{ color: Colors.C8, fontSize: 14 }}>上传截图</Text>
                                </View>
                            </TouchableOpacity>
                        }
                        {this.renderPayShot()}
                    </View>
                    {this.state.trdeData.status === 2 && this.state.trdeData.buyerUid === this.props.userId &&
                        <View style={{ width: 140, alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, color: Colors.C0, padding: 11 }}>
                                截图示例
                            </Text>
                            <TouchableOpacity onPress={() => { this.displayEGshot() }}>
                                <Image style={Styles.screenshotImg} source={require('../../images/Alipay.png')} />
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            </View>
        )
    }

    getDealTime() {
        /* 已付款把支付时间赋给 dealTime */
        if (this.state.trdeData.status === 3) {
            return new Date(this.state.trdeData.paidEndTime)
        } else {
            return new Date(this.state.trdeData.dealEndTime)
        }
    }
    /**
     * 剩余打款倒计时
     */
    getWarnTime() {
        /* 获取开始时间 */
        let deadline = this.getDealTime()

        /* 获取当前时间 */
        let Today = new Date();
        let nowHour = Today.getHours();
        let nowMinute = Today.getMinutes();
        let nowSecond = Today.getSeconds();
        let nowDate = Today.getDate();
        let Dateleft = 31 - nowDate

        /* 获取截止时间 */
        let deadHour = deadline.getHours();
        let deadMinute = deadline.getMinutes();
        let deadSecond = deadline.getSeconds();

        /* 倒计时计算 */
        hour = deadHour - nowHour
        minute = deadMinute - nowMinute
        second = deadSecond - nowSecond
        if (second < 0) {
            second = 60 + second;
            minute = minute - 1;
        }
        if (minute < 0) {
            minute = 60 + minute;
            hour = hour - 1;
        }
        if (hour < 0) {
            hour = 24 + hour;
            Dateleft = Dateleft - 1;
        }
        if (hour < 10) hour = "0" + hour;
        if (minute < 10) minute = "0" + minute;
        if (second < 10) second = "0" + second;
        if (deadline > new Date()) {
            if (this.state.trdeData.buyerUid === this.props.userId && this.state.trdeData.status === 3) {
                return `等待卖家确认 ${hour}:${minute}:${second}`
            }
            if (this.state.trdeData.buyerUid !== this.props.userId && this.state.trdeData.status === 3) {
                return `等待确认 ${hour}:${minute}:${second}`
            }
            if (this.state.trdeData.buyerUid === this.props.userId) {
                return `剩余打款时间 ${hour}:${minute}:${second}`;
            } else {
                return `等待买家打款 ${hour}:${minute}:${second}`;
            }

        } else {
            if (this.interval) clearInterval(this.interval);
            if (this.state.trdeData.status === 3) {
                //自动释放
                // this.systemConfirmTrad();
                return "交易超时";
            } else {
                return "支付超时";
            }
        }

    }
    /**
     * 判断显示提示文案
     */
    prompt() {
        if (this.state.trdeData.status === 5) {
            return "订单申诉中..."
        }
        return this.getWarnTime();
    }
    /**
     * 确认支付
     */
    confirmPaid() {
        Keyboard.dismiss();
        if (!this.state.avatarSource) {
            Toast.show({
                text: "请上传支付截图",
                position: "top",
                textStyle: { textAlign: "center" }
            })
            return;
        }
        let params = {
            orderNum: this.state.trdeData.id,
            picUrl: this.state.avatarSource
        }
        let that = this;
        Send("api/Trade/Paid", params).then(res => {
            if (res.code == 200) {
                Toast.show({
                    text: "支付成功",
                    position: "top",
                    textStyle: { textAlign: "center" }
                })
                that.state.trdeData.status = 3;
                that.setState({
                    paidTime: res.data.paidEndTime,
                }, () => {
                    Actions.pop(that.props.callBack());
                })
            } else {
                Toast.show({
                    text: res.message,
                    position: "top",
                    textStyle: { textAlign: "center" }
                })
            }
        })
    }
    /**
     * 判断是否能提交申诉
     */
    dispalyAppealPage() {
        if (this.state.trdeData.status === 5) {
            return (
                <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center' }}>
                </View>
            )
        } else {
            return this.isDisplaySend();
        }
    }
    /**
     * 改变申诉状态
     */
    reloadCallBack() {
        this.state.trdeData.status = 5;
    }
    /**
     * 根据时间判断用户是否可以发送
     */
    isDisplaySend() {
        let deadline = this.getDealTime()
        if (deadline > new Date()) {
            return (
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => {
                        Actions.AppealPage({
                            tradId: this.state.trdeData.id,
                            tradeIdx: this.props.tradeIdx,
                            reloadCallBack: this.reloadCallBack.bind(this)
                        })
                    }}>
                        <View style={[Styles.footerBtn, { paddingLeft: 13, paddingRight: 13 }]}>
                            <Text style={Styles.footerTxt}>
                                申诉
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.setState({ modalCancleButListVisible: true })}>
                        <View style={[Styles.footerBtn, { marginLeft: 8 }]}>
                            <Text style={Styles.footerTxt}>发送</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        } else {
            return (
                <View style={{ flexDirection: "row" }}>
                    <View style={Styles.footerBtn}>
                        <Text style={Styles.footerTxt}>申诉</Text>
                    </View>
                    <View style={[Styles.footerBtn, { marginLeft: 8 }]}>
                        <Text style={Styles.footerTxt}>发送</Text>
                    </View>
                </View>
            )
        }
    }
    /**
     * 渲染Footer
     */
    renderFooter() {
        let deadline = this.getDealTime()
        if (this.state.trdeData.buyerUid === this.props.userId) {
            if (this.state.trdeData.status === 2 && deadline > new Date()) {
                return (
                    <TouchableOpacity onPress={() => this.confirmPaid()}>
                        <View style={Styles.footerBtn}>
                            <Text style={Styles.footerTxt}>确认支付</Text>
                        </View>
                    </TouchableOpacity>
                )
            } else {
                if (this.state.trdeData.status === 3) {
                    return (
                        <View style={Styles.footerBtn}>
                            <Text style={Styles.footerTxt}>
                                已支付
                            </Text>
                        </View>
                    )
                }
            }
        } else {
            if (this.state.trdeData.status === 3 || this.state.trdeData.status === 5) {
                return (
                    <View>
                        {this.dispalyAppealPage()}
                    </View>
                )
            }
        }
    }
    /**
     * 系统确认交易
     */
    systemConfirmTrad = () => {
        Send("api/Trade/ForcePaidCoin", {}, 'get').then(res => {
            if (res.code == 200) {
                Toast.show({
                    text: "发送成功",
                    position: "bottom",
                    textStyle: { textAlign: "center" }
                })
            }
        })
    }
    /**
     * 确认发送
     */
    confirmTradPwd = () => {
        Keyboard.dismiss();
        if (this.state.tradePwd.length === 0 || this.state.tradePwd.length < 6 || this.state.tradePwd.length > 16) {
            Toast.show({
                text: "交易密码为6-16位",
                position: "bottom",
                textStyle: { textAlign: "center" }
            })
            return;
        }
        let that = this;
        if (!that.state.optionLoading) that.setState({ optionLoading: true });
        let params = {
            orderNum: this.state.trdeData.id,
            tradePwd: this.state.tradePwd
        }
        Send("api/Trade/PaidCoin", params).then(res => {
            if (res.code == 200) {
                Toast.show({
                    text: "发送成功",
                    position: "bottom",
                    textStyle: { textAlign: "center" }
                })
                that.setState({ modalCancleButListVisible: false, optionLoading: false }, () => {
                    setTimeout(() => Actions.pop(that.props.callBack()), 1000)
                })
            } else {
                that.setState({ optionLoading: false });
                Toast.show({
                    text: res.message,
                    position: "bottom",
                    textStyle: { textAlign: "center" }
                })
            }
        })
    }

    /**
     * 渲染交易密码
     */
    renderModalPwd() {
        let { modalCancleButListVisible, optionLoading } = this.state;
        return (
            <Modal animationType='slide' visible={modalCancleButListVisible} transparent onRequestClose={() => { }}>
                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <View style={{ backgroundColor: Colors.exchangeBg }}>
                        <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={Styles.publishBuy}>输入交易密码</Text>
                        </View>
                        <View style={[Styles.modalBodyPrice, { marginTop: 40 }]}>
                            <View style={Styles.modalBodyLeft}>
                                <Text style={Styles.price}>交易密码</Text>
                            </View>
                            <View style={Styles.modalBodyRight}>
                                <View style={Styles.textInputContainer}>
                                    <TextInput style={Styles.publishTextInput} secureTextEntry placeholder="请输入交易密码" placeholderTextColor={Colors.White} underlineColorAndroid="transparent" keyboardType="numeric"
                                        onChangeText={tradePwd => this.setState({ tradePwd })}
                                        returnKeyType="done"
                                        onSubmitEditing={() => this.confirmTradPwd}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={Styles.modalFooter}>
                            <TouchableOpacity disabled={optionLoading} onPress={() => this.setState({ modalCancleButListVisible: false })}>
                                <View style={[Styles.publishConfirm, { backgroundColor: Colors.exchangeInput }]}>
                                    <Text style={Styles.publishConfirmText}>取消</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={optionLoading} onPress={() => this.confirmTradPwd()}>
                                <View style={[Styles.publishConfirm, { backgroundColor: Colors.mainTab }]}>
                                    <Text style={Styles.publishConfirmText}>{optionLoading ? '发送中...' : '确定'}</Text>
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
     * 控制放大缩小截图
     */
    displayFullScreenshot() {
        this.setState({
            isImgDispalyFullScreen: true
        })
    }
    /**
     * 渲染支付截图大图
     */
    renderScreenshotModal() {
        let { isImgDispalyFullScreen } = this.state;
        let bigPic = this.state.trdeData.pictureUrl == '' || this.state.trdeData.pictureUrl == null ? this.state.avatarSource : this.state.trdeData.pictureUrl;
        return (
            <Modal animationType='slide' visible={isImgDispalyFullScreen} animationType={'none'} transparent onRequestClose={() => { }}>
                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <View style={Styles.modalBody}>
                        <TouchableOpacity onPress={() => {
                            this.setState({
                                isImgDispalyFullScreen: false
                            })
                        }}>
                            <Image
                                style={{
                                    width: Metrics.screenWidth,
                                    height: Metrics.screenHeight,
                                    resizeMode: "contain",
                                }}
                                source={{ uri: bigPic }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
    render() {
        return (
            <View style={Styles.container}>
                <Header title="订单详情" onLeftPress={() => Actions.pop(this.props.callBack())} />
                <ScrollView>
                    {this.renderHeader()}
                    <View style={Styles.bcdView}>
                        {this.renderSeller()}
                        {this.renderBuyer()}
                        {this.renderScreenshot()}
                    </View>
                </ScrollView>
                <View style={Styles.footerStyle}>
                    <Text style={[Styles.footerTxt, { color: Colors.C8 }]}>
                        {this.prompt()}
                    </Text>
                    {this.renderFooter()}
                </View>
                {this.renderScreenShotExample()}
                {this.renderModalPwd()}
                {this.renderScreenshotModal()}
            </View>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id,
    alipayPic: state.user.alipayPic,
});

const mapDispatchToProps = dispatch => ({
});
export default connect(mapStateToProps, mapDispatchToProps)(TransactionDetail);

const Styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#ffffff" },
    bcdView: { padding: 10 },
    header: {
        backgroundColor: Colors.mainTab,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 20,
        paddingBottom: 20
    },
    body: {
        marginTop: 15,
    },
    title: {
        marginLeft: 6,
        color: Colors.C0,
        fontSize: 18,
        fontWeight: "500",
    },
    verticalLine: {
        height: 20,
        width: 10
    },
    bcdTitleView: {
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerDtitle: {
        fontSize: 14,
        color: Colors.C8,
        flexWrap: "wrap",
    },
    headerDtxt: {
        fontSize: 14,
        color: Colors.C8,
        flexWrap: "wrap"
    },
    bodyDtxt: {
        fontSize: 14,
        color: Colors.C3,
        flexWrap: "wrap",
    },
    imgStyle: {
        marginTop: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        resizeMode: "stretch"
    },
    screenshotStyle: {
        marginLeft: 12.5,
        flexDirection: "row",
        marginTop: 5,
        flexWrap: "wrap",
    },
    uploadView: {
        width: 100,
        padding: 12,
        backgroundColor: Colors.mainTab,
        alignItems: "center",
        borderRadius: 10,
    },
    screenshotImg: {
        marginTop: 16,
        width: 120,
        height: 180,
        resizeMode: "stretch",
        borderRadius: 10,
        borderColor: Colors.White,
        borderWidth: 1
    },
    close: {
        backgroundColor: Colors.mainTab,
        height: 20,
        width: 20,
        borderRadius: 13,
        position: 'absolute',
        left: -15,
    },
    modalBody: {
        flexDirection: "column",
        justifyContent: 'flex-start',
        backgroundColor: Colors.mainTab,
        width: Metrics.screenWidth,
        height: Metrics.screenHeight
    },
    footerStyle: {
        height: 50,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: Colors.mainTab,
    },
    footerBtn: {
        alignItems: "center",
        backgroundColor: Colors.C8,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 20,
    },
    footerTxt: {
        color: Colors.mainTab,
        fontSize: 15,
    },
    publishBuy: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold'
    },
    modalBodyPrice: {
        marginTop: 26,
        flexDirection: 'row',
        alignItems: 'center'
    },
    modalBodyLeft: {
        width: Metrics.screenWidth * 0.3,
        alignItems: 'flex-end'
    },
    modalBodyRight: {
        width: Metrics.screenWidth * 0.7,
        alignItems: 'flex-start'
    },
    textInputContainer: {
        marginLeft: 10,
        paddingLeft: 8,
        width: Metrics.screenWidth * 0.7 * 0.8,
        height: 40, borderRadius: 6,
        backgroundColor: Colors.exchangeInput
    },
    publishTextInput: {
        flex: 1,
        color: '#ceced0'
    },
    modalFooter: {
        flexDirection: 'row',
        marginTop: 20
    },
    publishConfirm: {
        height: 60,
        width: Metrics.screenWidth * 0.5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    publishConfirmText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.White
    },
    modalHeader: {
        flex: 1,
        opacity: 0.6,
        backgroundColor: '#FFFFFF'
    },
    price: {
        fontSize: 14,
        color: Colors.White
    },
});