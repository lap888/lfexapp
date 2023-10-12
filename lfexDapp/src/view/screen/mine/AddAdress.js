import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Header } from '../../components/Index';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
// import { Toast } from 'native-base';
import { Colors, Metrics } from '../../theme/Index';
import { connect } from 'react-redux';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';

class Addaddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 0,
            userId: 0,
            name: '',
            phone: '',
            address: '',
            area: '',
            city: '',
            province: '',
            postCode: '',
            isDefault: 0
        };
    }

    componentDidMount() {
        if (this.props.ty == 'modify') {
            this.setState(this.props.adress)
        }
    }

    onPressSave = () => {
        Send('api/UserAddress/Edit', this.state).then(res => {
            Toast.tipTop(res.message);
            Actions.pop();
        });
    }
    render() {
        return (
            <LinearGradient style={{ flex: 1 }} colors={[Colors.mainTab, Colors.LightG]} start={{ x: 0, y: 0.9 }} end={{ x: 0, y: 0 }}>
                <Header title="编辑地址" />
                <View style={{ width: Metrics.screenWidth, height: Metrics.screenHeight * 0.88 }}>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ width: Metrics.screenWidth * 0.3, height: 48, paddingLeft: 10, marginTop: 10, alignItems: 'center', justifyContent: 'center', }}>
                            <Text style={{ color: Colors.White, fontSize: 16 }}>收货人:</Text>
                        </View>
                        <TextInput style={styles.inputViewStyle}
                            placeholder="请输入收货人"
                            defaultValue={this.state.name}
                            editable={true}
                            onChangeText={(text) => {
                                this.setState({
                                    name: text
                                })
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ width: Metrics.screenWidth * 0.3, height: 48, paddingLeft: 10, marginTop: 10, alignItems: 'center', justifyContent: 'center', }}>
                            <Text style={{ color: Colors.White, fontSize: 16 }}>手机号码:</Text>
                        </View>
                        <TextInput style={styles.inputViewStyle}
                            placeholder="请输入手机号码"
                            defaultValue={this.state.phone}
                            editable={true}
                            onChangeText={(text) => {
                                this.setState({
                                    phone: text
                                })
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ width: Metrics.screenWidth * 0.3, height: 48, paddingLeft: 10, marginTop: 10, alignItems: 'center', justifyContent: 'center', }}>
                            <Text style={{ color: Colors.White, fontSize: 16 }}>省份:</Text>
                        </View>
                        <TextInput style={styles.inputViewStyle}
                            placeholder="请输入所在省"
                            defaultValue={this.state.province}
                            editable={true}
                            onChangeText={(text) => {
                                this.setState({
                                    province: text
                                })
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ width: Metrics.screenWidth * 0.3, height: 48, paddingLeft: 10, marginTop: 10, alignItems: 'center', justifyContent: 'center', }}>
                            <Text style={{ color: Colors.White, fontSize: 16 }}>城市:</Text>
                        </View>
                        <TextInput style={styles.inputViewStyle}
                            placeholder="请输入所在城市"
                            defaultValue={this.state.city}
                            editable={true}
                            onChangeText={(text) => {
                                this.setState({
                                    city: text
                                })
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ width: Metrics.screenWidth * 0.3, height: 48, paddingLeft: 10, marginTop: 10, alignItems: 'center', justifyContent: 'center', }}>
                            <Text style={{ color: Colors.White, fontSize: 16 }}>区县:</Text>
                        </View>
                        <TextInput style={styles.inputViewStyle}
                            placeholder="请输入所在区县"
                            defaultValue={this.state.area}
                            editable={true}
                            onChangeText={(text) => {
                                this.setState({
                                    area: text
                                })
                            }}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ width: Metrics.screenWidth * 0.3, height: 48, paddingLeft: 10, marginTop: 10, alignItems: 'center', justifyContent: 'center', }}>
                            <Text style={{ color: Colors.White, fontSize: 16 }}>详细地址:</Text>
                        </View>
                        <TextInput style={styles.inputViewStyle}
                            placeholder="请输入详细地址"
                            defaultValue={this.state.address}
                            editable={true}
                            onChangeText={(text) => {
                                this.setState({
                                    address: text
                                })
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ width: Metrics.screenWidth * 0.3, height: 48, paddingLeft: 10, marginTop: 10, alignItems: 'center', justifyContent: 'center', }}>
                            <Text style={{ color: Colors.White, fontSize: 16 }}>邮政编码:</Text>
                        </View>
                        <TextInput style={styles.inputViewStyle}
                            placeholder="请输入邮政编码"
                            defaultValue={this.state.postCode}
                            editable={true}
                            onChangeText={(text) => {
                                this.setState({
                                    postCode: text
                                })
                            }}
                        />
                    </View>
                </View>
                <TouchableOpacity onPress={() => this.onPressSave()} style={{ flex: 1, width: Metrics.screenWidth, height: Metrics.screenHeight * 0.2, backgroundColor: Colors.C16, justifyContent: 'center', alignItems: 'center', borderRadius: 2 }}>
                    <Text style={{ fontSize: 16, color: Colors.White }}>保存</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }
}
const mapStateToProps = state => ({
    userId: state.user.id,
    mobile: state.user.mobile
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Addaddress);

const styles = StyleSheet.create({
    businessPwdPageView: {
        backgroundColor: "#ffffff",
        height: Metrics.screenHeight * 1,
    },
    pwdViewStyle: {
        padding: 10,
    },
    promptTxt: {
        fontSize: 12,
        color: Colors.mainTab,
    },
    inputViewStyle: {
        height: 48,
        paddingLeft: 10,
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: Colors.White,
        width: Metrics.screenWidth * 0.6
    },
    countDownButtonStyle: {
        height: 48,
        padding: 5,
        borderRadius: 5,
        marginTop: 10,
        width: Metrics.screenWidth * 0.3,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.LightG
    },
    submitView: {
        height: Metrics.screenHeight * 0.5,
        justifyContent: 'center',
        alignItems: "center",
    },
    submitBtn: {
        backgroundColor: Colors.mainTab,
        width: Metrics.screenWidth * 0.6,
        alignItems: "center",
        borderRadius: 8,
    },
});