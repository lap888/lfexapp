/*
 * @Author: top.brids 
 * @Date: 2020-09-02 23:42:58 
 * @Last Modified by: top.brids
 * @Last Modified time: 2020-09-03 00:11:38
 */

import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Colors, Metrics } from '../../theme/Index';
import { Header } from '../../components/Index';
import { Send } from '../../../utils/Http';
import { Actions } from 'react-native-router-flux';
import CoinFRank from './rank/CoinFRank';

export default class CoinF extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    /**
       * 进入交易规则界面
       */
    onRightPress() {
        Send(`api/system/CopyWriting?type=otc_rule`, {}, 'get').then(res => {
            Actions.push('CommonRules', { title: '交易规则', rules: res.data });
        });
    }
    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <Header leftText={'法币交易'} statusBarBackgroundColor={Colors.titleMain} leftStyle={{ color: Colors.titleMainTxt, fontSize: 18, fontWeight: 'bold', width: Metrics.screenWidth / 2 }} backgroundColor={Colors.titleMain} rightText="规则" rightStyle={{ color: Colors.titleMainTxt }} onRightPress={() => this.onRightPress()} />
                <CoinFRank />
            </View>
        );
    }
}
