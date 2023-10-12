import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-community/clipboard';

import { Header } from '../../components/Index';
import { Toast } from '../../common';
import { Colors } from '../../theme/Index';
import { connect } from 'react-redux';

class RechargeMoney extends Component {
    constructor(props) {
        super(props);
        this.state = {
            adress: props.adress
        };
    }

    copyAddress = () => {
        Toast.tip('复制成功');
        Clipboard.setString(this.state.adress);
    }
    
    render() {
        const { data } = this.props;
        return (
            <View style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
                <Header title={`${data.name}充值`} />
                <View style={{ backgroundColor: Colors.White, paddingVertical: 20,}}>
                    <View style={{alignSelf: 'center', height: 100, width: 100, justifyContent: 'center', alignItems: 'center', borderColor: Colors.backgroundColor, borderWidth: 0.5}}>
                        <View style={{ borderWidth: 4, borderColor: Colors.White, borderRadius: 5 }}>
                            <QRCode
                                value={this.state.adress}
                                logoSize={30}
                                size={90}
                            />
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 10, marginTop: 10}}>
                        <Text style={{fontSize: 14, color: Colors.grayFont}}>充币地址</Text>
                        <Text style={{fontSize: 14}}>{this.props.adress}</Text>
                    </View>
                    <TouchableOpacity style={styles.btnpost} onPress={this.copyAddress}>
                        <Text style={{fontSize: 16, color: Colors.White}}>复制地址</Text>
                    </TouchableOpacity>
                </View>
                <View style={{paddingHorizontal: 10, marginTop: 10}}>
                    <Text style={{fontSize: 13}}>注意事项：{data.remark}</Text>
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    adress: state.user.adress,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(RechargeMoney);

const styles = StyleSheet.create({
    btnpost: { 
        height: 40, 
        marginTop: 20, 
        marginHorizontal: 30, 
        backgroundColor: Colors.main, 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: 20 
    },
})