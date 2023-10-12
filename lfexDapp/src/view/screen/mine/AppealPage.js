import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import { StyleSheet, View, Image, Text, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { connect } from 'react-redux';
import { Textarea } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import ImagePicker from 'react-native-image-picker';
import { Header } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

class AppealPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            txtValue: "",
            avatarSource: "",
            isImgDispalyFullScreen: false,
        }
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
    /* 控制放大缩小截图 */
    displayFullScreenshot() {
        this.setState({
            isImgDispalyFullScreen: true
        })
    }
    isDisplayBigImg() {
        if (this.state.avatarSource) {
            return (
                <TouchableOpacity onPress={() => { this.displayFullScreenshot() }}>
                    <Image
                        style={styles.screenshotImg}
                        source={{ uri: this.state.avatarSource }}
                    />
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity style={styles.screenshotImg} onPress={this.handleButtonPress}>
                    <FontAwesome name="image" color={Colors.mainTab} size={30} />
                    <Text style={{fontSize: 16, marginTop: 10}}>上传截图</Text>
                </TouchableOpacity>
            )
        }
    }
    /* 显示清除截图图标 */
    clearScreenshot() {
        if (this.state.avatarSource) {
            return (
                <TouchableOpacity onPress={() => {
                    this.setState({
                        avatarSource: ""
                    })
                }}>
                    <View style={styles.close}>
                        <Image style={{ height: 20, width: 20 }}
                            source={require("../../images/close.png")}
                        />
                    </View>
                </TouchableOpacity>
            )
        }
    }
    /* 显示大图 */
    dispalyImage() {
        let { isImgDispalyFullScreen } = this.state;
        return (
            <Modal animationType='slide' visible={isImgDispalyFullScreen} animationType={'none'} transparent onRequestClose={() => { }}>
                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <View style={styles.modalBody}>
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
                                source={{ uri: this.state.avatarSource }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalHeader} />
                </View>
            </Modal>
        )
    }
    submitAppeal() {
        // tradId
        if (!this.state.avatarSource) {
            Toast.show({
                text: "请上传支付截图",
                position: "top",
                textStyle: { textAlign: "center" }
            })
            return;
        }
        if (!this.state.txtValue) {
            Toast.show({
                text: "请填写申诉内容",
                position: "top",
                textStyle: { textAlign: "center" }
            })
            return;
        }
        let params = {
            description: this.state.txtValue,
            orderId: this.props.tradId,
            picUrl: this.state.avatarSource
        }
        let that = this;
        Send("api/Trade/CreateAppeal", params).then(res => {
            if (res.code == 200) {
                Toast.show({
                    text: "提交成功",
                    position: "top",
                    textStyle: { textAlign: "center" }
                })
                setTimeout(() => Actions.pop(that.props.reloadCallBack()), 1000)
            } else {
                Toast.show({
                    text: res.message,
                    position: "top",
                    textStyle: { textAlign: "center" }
                })
            }
        });
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Header title="申诉" />
                <ScrollView style={styles.view}>
                    <View style={styles.txtAreaView}>
                        <Text style={styles.txtStyle}>申诉说明</Text>
                        <Textarea
                            onChangeText={(text) => {
                                this.state.txtValue = text
                            }}
                            rowSpan={8}
                            placeholder="请填写您要申诉的内容"
                            style={styles.txtAreaStyle}
                        />
                    </View>
                    <View style={styles.txtAreaView}>
                        <View style={styles.last}>
                            <Text style={styles.txtStyle}>凭证</Text>
                            {/* <TouchableOpacity onPress={() => { this.handleButtonPress() }}>
                                <View style={styles.uploadView}>
                                    <Text style={{ color: "#ffffff", fontSize: 15 }}>上传截图</Text>
                                </View>
                            </TouchableOpacity> */}
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            {this.isDisplayBigImg()}
                            {this.clearScreenshot()}
                        </View>
                    </View>
                </ScrollView>
                <View style={{ alignItems: "center" }}>
                    <TouchableOpacity style={styles.submitBtn} onPress={() => { this.submitAppeal() }}>
                        <Text style={{ color: "#ffffff", fontSize: 15 }}>提交</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    {this.dispalyImage()}
                </View>
            </View>
        );
    }
}
const mapStateToProps = state => ({
    logged: state.user.logged,
    userId: state.user.id,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(AppealPage);

const styles = StyleSheet.create({
    view: {
        padding: 10
    },
    last: {
        flexDirection: "row",
        marginBottom: 10,
    },
    uploadView: {
        width: Metrics.screenWidth * 0.4,
        padding: 10,
        backgroundColor: Colors.mainTab,
        alignItems: "center",
        borderRadius: 10,
        marginLeft: 20
    },
    submitBtn: {
        width: Metrics.screenWidth * 0.6,
        height: 40,
        justifyContent: 'center',
        backgroundColor: Colors.mainTab,
        alignItems: "center",
        borderRadius: 20,
        marginVertical: 10,
    },
    screenshotImg: {
        width: Metrics.screenWidth * 0.3,
        height: Metrics.screenWidth * 0.4,
        resizeMode: "stretch",
        marginRight: 5,
        marginTop: 5,
        borderWidth: 1,
        borderColor: Colors.main,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    txtAreaView: {
        marginVertical: 5,
        padding: 20,
    },
    txtAreaStyle: {
        backgroundColor: Colors.backgroundColor,
        borderRadius: 5,
    },
    txtStyle: {
        marginBottom: 10,
        fontSize: 18,
        color: Colors.mainTab
    },
    modalBody: {
        flexDirection: "column",
        justifyContent: 'flex-end',
        backgroundColor: '#25252b',
        width: Metrics.screenWidth
    },
    modalHeader: {
        flex: 1,
        opacity: 0.6,
        backgroundColor: '#FFFFFF'
    },
    close: {
        backgroundColor: Colors.mainTab,
        height: 20,
        width: 20,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 13,
        marginLeft: -8,
        marginTop: -5
    },
})