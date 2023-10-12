import React, { Component } from 'react';
import { View, Text, Keyboard, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';

import { Header } from '../../../components/Index';
import { SET_USERINVITER } from '../../../../redux/ActionTypes';
import { Colors, Metrics } from '../../../theme/Index';
import { Send } from '../../../../utils/Http';
import { Toast } from '../../../common';

const verify = /^[0-9a-zA-Z\u4e00-\u9fa5]*$/;

class EditInviterCode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nickName: ''
        };
    }
    submit = () => {
        Keyboard.dismiss();
        let name = this.state.nickName;
        params = { name: name, uId: this.props.userId }

        /* 为空验证 */
        if (name.length === 0) {
            return (
                Toast.tip('邀请码不能为空')
            )
        }

        /* 格式验证(必须是数字、字母或汉字) */
        if (!name.match(verify)) {
            return (
                Toast.tip('邀请码格式不正确')
            )
        }
        /* 长度验证 */
        if (name.length > 15) {
            return (
                Toast.tip('邀请码不能超过15位')
            )
        }

        Send("api/ModifyUserInviterCode?name=" + name, {}, 'get').then(res => {
            if (res.code == 200) {
                Toast.tip('修改邀请码成功');
                this.props.resetUserInfo(res.data);
                Actions.pop();
            } else {
                Toast.tip(res.message);
            }
        });
    }

    render() {
        return (
            <View>
                <Header title="推广邀请码" rightText="保存" onRightPress={() => this.submit()} />
                <View style={{paddingHorizontal: 20}}>
                    <View style={{ marginTop: 10, backgroundColor: "#ffffff" }}>
                        <Text style={{ color: Colors.main, fontSize: 12, }}>提示: 变更邀请码需要支付0.5LF服务费用 </Text>
                    </View>
                    <View style={{height: 40, borderBottomColor: Colors.greyText, borderBottomWidth: 1}}>
                        <TextInput 
                            style={{ flex: 1, padding: 0 }} 
                            placeholder="请输入1-8位的邀请码" 
                            value={this.state.nickName}
                            maxLength={8}
                            onChangeText={(value) => this.setState({ nickName: value })} 
                            />
                    </View>
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
    resetUserInfo: name => dispatch({ type: SET_USERINVITER, payload: { name } }),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditInviterCode);
