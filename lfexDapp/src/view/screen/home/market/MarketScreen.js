import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Pressable, ScrollView, StyleSheet, DeviceEventEmitter } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Coin } from '../../../../api';
import { Header } from '../../../components/Index';
import { Colors, Metrics } from '../../../theme/Index';
import CurrencyDrawer from './CurrencyDrawer';
import KLine from './KLine';
import PriceFloat from './PriceFloat';
const redColor = 'rgba(229,51,74,1)';
const greenColor = 'rgba(37,172,166,1)';

export default class MarketScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: true,
            item: this.props.item,
            data:'',
        };
    }

    componentDidMount() {
        this.getbordData()
    }

    getbordData = () => {
        Coin.KLinePanel(this.state.item.name)
        .then((data) => {
            this.setState({data: data})
        }).catch((err) => console.log('err', err))
    }

    setItem = (item) => {
        this.setState({item: item},() => {
            this.getbordData();
        })
    }

    render() {
        const { data, item } = this.state;

        return (
            <View style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
                <ScrollView style={{flex: 1}}>
                    <View style={{paddingTop: Metrics.STATUSBAR_HEIGHT, height: Metrics.HEADER_HEIGHT, width: Metrics.screenWidth, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity style={{width: 40, alignItems: 'center', borderRightWidth: 1}} onPress={() => Actions.pop()}>
                            <Icon name={'ios-chevron-back'} size={20} color={Colors.blakText}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flex: 1, flexDirection: 'row', paddingLeft: 10}} onPress={() => this.currencyDrawer.showModal()}>
                            {/* <Icon name={'ios-list-outline'} size={20} color={Colors.blakText} /> */}
                            <AntDesign name={'menu-fold'} size={20} color={Colors.blakText} />
                            <Text style={{fontSize: 15, color: Colors.blakText, marginLeft: 5}}>{item.name}/USDT</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row', paddingHorizontal: 15, marginBottom: 10}}>
                        <View style={{marginTop: 5, flex: 3}}>
                            <Text style={{fontSize: 25, color: data.rate < 0 ? redColor : greenColor}}>{data.nowPrice}</Text>
                            <Text style={{fontSize: 13, color: Colors.blakText}}>≈￥ {Number(data.rmbAvgPrice).toFixed(4)}    <Text style={{ color: data.rate < 0 ? redColor : greenColor }}> {Number(data.rate).toFixed(4)}%</Text></Text>
                        </View>
                        <View style={{marginTop: 5, flex: 2, paddingLeft: 10}}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{fontSize: 12, color: Colors.greyText, flex: 1 }}>高</Text>
                                <Text style={{fontSize: 12, color: Colors.greyText }}>{data.todayMax}</Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{fontSize: 12, color: Colors.greyText, flex: 1 }}>低</Text>
                                <Text style={{fontSize: 12, color: Colors.greyText }}>{data.todayMin}</Text>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={{fontSize: 12, color: Colors.greyText, flex: 1 }}>24H</Text>
                                <Text style={{fontSize: 12, color: Colors.greyText }}>{data['24amount']}</Text>
                            </View>
                        </View>
                    </View>
                    <KLine coinType={item.name}/>
                    <PriceFloat coinType={item.name}/>
                </ScrollView>
                <View style={{height: 50, flexDirection: 'row', paddingHorizontal: 20, paddingTop: 5, backgroundColor: Colors.White}}>
                    <TouchableOpacity style={styles.btn1} onPress={() => { DeviceEventEmitter.emit('jumpTab'); Actions.pop() }}>
                        <Text style={{fontSize: 14, color: Colors.White }}>买入</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn2} onPress={() => { DeviceEventEmitter.emit('jumpTab'); Actions.pop() }}>
                        <Text style={{fontSize: 14, color: Colors.White}}>卖出</Text>
                    </TouchableOpacity>
                </View>
                <CurrencyDrawer ref={cModal => this.currencyDrawer = cModal} setItem={this.setItem}/>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    btn1: {height: 40, borderRadius: 1, flex: 1, backgroundColor: greenColor, alignItems: 'center', justifyContent: 'center'},
    btn2: {height: 40, borderRadius: 1, marginLeft: 15, flex: 1, backgroundColor: redColor, alignItems: 'center', justifyContent: 'center'},
})
