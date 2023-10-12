/*
 * @Author: top.brids 
 * @Date: 2020-01-04 21:56:24 
 * @Last Modified by: top.brids
 * @Last Modified time: 2020-09-15 15:34:52
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import { Metrics, Colors } from '../../theme/Index';
import { freeGenWord, interception } from '../../../utils/BaseValidate';

export default class TransactionListItem extends PureComponent {
    static propTypes = {
        item: PropTypes.object,
    };
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        let { item, userId, type } = this.props;
        let { buyerUid, sellerUid, price, amount, dishonesty, uType, name } = item;
        let action = ''
        if (type === 'SELL') {
            action = sellerUid !== userId ? "购买" : "取消";
        }
        if (type === 'BUY') {
            action = buyerUid !== userId ? "出售" : "取消";
        }
        return (
            <View style={Styles.transaction}>
                <View style={Styles.body}>
                    <View style={Styles.saleInfo}>
                        <View style={Styles.avatar}>{uType == 0 ? <Text style={{ color: Colors.White }}>{`${freeGenWord()}`}</Text> : <Icon name={'ios-logo-vimeo'} color='#fff' size={20} />}</View>
                        <Text style={{ marginLeft: 10, fontWeight: 'bold', fontSize: 16 }} numberOfLines={1} >{uType == 0 ? `匿名` : `${interception(name, 6)}`}</Text>
                        <Text style={Styles.transactionNumber}>支付方式  </Text>
                        {this.props.title == 'bibi' ?
                            <Image style={{ width: 20, height: 20, }} source={require('../../images/profile/usdt.png')} />
                            : <Image style={{ width: 20, height: 20, }} source={require('../../images/profile/biao.png')} />}
                        
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                        <Text style={[Styles.number, { color: Colors.C11 }]}>{`数量  `}</Text>
                        <Text style={Styles.number}>{`${amount}${this.props.coinType}`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                        <Text style={[Styles.price, { color: Colors.C11 }]}>{`单价  `}</Text>
                        <Text style={Styles.price}>{`${this.props.title == 'bibi' ? '$' : '￥'}${price}`}</Text>                        
                        <Text style={Styles.transactionNumber}>{`最近30日成交 ${dishonesty}`}</Text>
                    </View>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity style={Styles.sale} onPress={() => this.props.toOptionBuyList(item)}>
                        <Text style={Styles.saleText}>{action}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
const Styles = StyleSheet.create({
    transaction: { flex: 1, margin: 10, marginLeft: 25, marginRight: 25, flexDirection: 'row', paddingBottom: 10, alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: Colors.LightGrey, borderBottomWidth: 1 },
    avatar: { height: 30, width: 30, borderRadius: 25, backgroundColor: Colors.mainTab, alignItems: 'center', justifyContent: 'center' },
    name: { fontWeight: 'bold', fontSize: 14 },
    body: { flex: 1 },
    saleInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4, width: Metrics.screenWidth - 40 },
    price: { fontSize: 16, color: Colors.mainTab },
    number: { fontSize: 16, color: Colors.mainTab },
    transactionNumber: { fontSize: 14, color: Colors.LightGrey, marginLeft: 10 },
    sale: { alignSelf: 'center', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 5, backgroundColor: Colors.mainTab },
    saleText: { fontSize: 15, color: '#FFFFFF' }
});

