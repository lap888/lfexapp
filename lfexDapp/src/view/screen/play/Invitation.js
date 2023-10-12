import React, { Component } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Image, Platform } from 'react-native';
import CameraRoll from "@react-native-community/cameraroll";
import { connect } from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import { Header } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import { WEB_PATH } from '../../../config/Index';

class Invitation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            qrcodeUrl: `${WEB_PATH}?code=${this.props.code == "0" ? this.props.mobile : this.props.code}`,
        }
    }
    /**
	 * HeaderRight点击事件
	 */
    onRightPress() {
        this.saveImage()
    }

    saveImage = async () => {
        if (Platform.OS == 'ios') {
            this.snapshot()
        }else {
            try {
                const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "哟哟吧想要使用您的相册存储权限",
                        message:
                            "没有您的存储权限将不能保存到相册",
                        buttonNeutral: "以后询问",
                        buttonPositive: "好的"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("允许");
                    this.snapshot()
                } else {
                    console.log("不允许");
                }
            } catch (err) {
                console.warn(err);
            }
        }
        
    };

    snapshot = () => {
        if (!this.refs.shareViewShot) return;
        captureRef(
            this.refs.shareViewShot, {
            format: 'jpg',
            quality: 1,
            result: "tmpfile"
        })
        .then((uri) => {
            return CameraRoll.save(uri)
        })
        .then((res) => {
            Toast.tipTop('已保存到相册，快去分享吧')
        }).catch((err) => console.warn('err', err))
    }
    
    /**
     * 渲染二维码
     */
    renderQRCode() {
        let invitCode = this.props.rcode == "0" ? this.props.mobile : this.props.rcode;
        let qrcodeUrl = `${WEB_PATH}?code=${invitCode}`;
        return (
            <View ref="shareViewShot" style={{flex: 1, backgroundColor: 'transparent' }}>
                <Image
                    source={require('../../images/inviter.png')}
                    resizeMode={'stretch'}
                    style={{flex: 1, width: Metrics.screenWidth}}
                />
                <View style={{position: 'absolute', backgroundColor: Colors.White, bottom: 10, height: 80, width: Metrics.screenWidth-40, marginHorizontal: 20, paddingLeft: 10, borderWidth: 1, borderColor: Colors.White, borderRadius: 5}}>
                    <Text style={{fontSize: 15, color: Colors.main, marginTop: 10, fontWeight: 'bold'}}>我的邀请码：<Text style={{color: Colors.blakText}}>{invitCode}</Text></Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                        <Image style={{borderRadius: 17.5,height: 35, width: 35}} source={{uri: this.props.avatarUrl}} />
                    <Text style={{fontSize: 14, color: Colors.main, marginLeft: 10}}>HI! 我是{this.props.name}</Text>
                    </View>
                    <View style={{ position: 'absolute', right: 10, top: 5 }}>
                        <View style={{ borderWidth: 4, borderColor: Colors.White, borderRadius: 5 }}>
                            <QRCode
                                value={qrcodeUrl}
                                logoSize={30}
                                size={60}
                            />
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        let qrcodeUrl = `${WEB_PATH}?code=${this.props.rcode == "0" ? this.props.mobile : this.props.rcode}`;
        return (
            <View style={Styles.container}>
                <Header title="邀请好友" rightText="保存" rightIconSize={20} onRightPress={this.saveImage} />
                {this.renderQRCode()}
                {/* <View style={{height: 90, width: Metrics.screenWidth, paddingLeft: 10, backgroundColor: Colors.White,}}>
                    <Text style={{fontSize: 15, color: Colors.main, marginTop: 10, fontWeight: 'bold'}}>看见那两年的说法</Text>
                    <Text style={{fontSize: 13, color: Colors.C11, marginTop: 5}}>看见那两年的说法看见那两年的说法</Text>
                    <View style={{ position: 'absolute', right: 10, top: 5 }}>
                        <View style={{ borderWidth: 4, borderColor: Colors.White, borderRadius: 5 }}>
                            <QRCode
                                value={qrcodeUrl}
                                logoSize={30}
                                size={50}
                            />
                        </View>
                    </View>
                </View> */}
            </View>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    mobile: state.user.mobile,
    name: state.user.name,
    avatarUrl: state.user.avatarUrl,
    rcode: state.user.rcode
});
const mapDispatchToProps = dispatch => ({

});
export default connect(mapStateToProps, mapDispatchToProps)(Invitation);

const Styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.mainTab },
    layout: { flexDirection: "row", paddingLeft: 10 },
    userPhoto: { width: 80, height: 80, borderRadius: 40, marginRight: 10 },
    layoutFont: { marginTop: 6, color: '#ffffff', fontSize: 17 },
    shareContainer: { position: 'absolute', backgroundColor: '#FFFFFF', height: 156, left: 0, right: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
    shareHeader: { alignSelf: 'center', padding: 20, fontSize: 16, fontWeight: "400" },
    shareBody: { flexDirection: 'row', paddingTop: 20 },
    shareItem: { justifyContent: 'center', alignItems: 'center', paddingLeft: 20 },
    shareImage: { justifyContent: 'center', alignItems: 'center', width: 50, height: 50 },
    shareText: { marginTop: 6 },
    shareFooter: { alignSelf: 'center', padding: 20 },
    shareFooterText: { fontSize: 16, fontWeight: "400" },
});
