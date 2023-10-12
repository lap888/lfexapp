import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Coin } from '../../../../api';
import { Colors, Metrics } from '../../../theme/Index';
const redColor = 'rgba(229,51,74,1)';
const greenColor = 'rgba(37,172,166,1)';

export default class PriceFloat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 0,
            // coinType: this.props.coinType,
            buyData: [],
            sellData: [],
            data: [],
            dataDetail: ''
        };
        this.coinType = this.props.coinType;
    }
    componentDidMount() {
        this.getdata(this.coinType)
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.coinType != nextProps.coinType) {
            this.coinType = nextProps.coinType;
            this.getdata(nextProps.coinType);
        }
        return true;
    }

    getdata = (coinType) => {
        const { type } = this.state;
        Coin.CoinData(type, coinType)
        .then((data) => {
            if (type == 0) {
                this.setState({
                    buyData: data.buyW,
                    sellData: data.sellW,
                })
            }
            if (type == 1) {
                this.setState({
                    data: data,
                })
            }if (type == 2) {
                this.setState({
                    dataDetail: data.remark,
                })
            }
        }).catch((err) => console.log('err', err))
    }

    selcet = (type) => {
        this.setState({type}, () => {
            this.getdata(this.coinType)
        })
    }

    render() {
        let { type, buyData, sellData, data, dataDetail } = this.state;
        return (
            <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', height: 40, backgroundColor: Colors.White, marginTop: 10, paddingHorizontal: 15}}>
                    <TouchableOpacity style={type == 0 ? styles.selecedItem : styles.unSelecedItem} onPress={() => this.selcet(0)}>
                        <Text style={type == 0 ? styles.selecedTxt : styles.unSelecedTxt}>委托订单</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={type == 1 ? styles.selecedItem : styles.unSelecedItem} onPress={() => this.selcet(1)}>
                        <Text style={type == 1 ? styles.selecedTxt : styles.unSelecedTxt}>最新成交</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={type == 2 ? styles.selecedItem : styles.unSelecedItem} onPress={() => this.selcet(2)}>
                        <Text style={type == 2 ? styles.selecedTxt : styles.unSelecedTxt}>币种简介</Text>
                    </TouchableOpacity>
                </View>
                {type === 0 && 
                    <View style={{paddingHorizontal: 15}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.greyText, height: 30}}>
                            <Text style={{flex: 1, fontSize: 12, color: Colors.greyText}}>买</Text>
                            <View style={{width: 20}}/>
                            <Text style={{flex: 1, fontSize: 12, color: Colors.greyText}}>卖</Text>
                        </View>
                        <View  style={{flexDirection: 'row', marginTop: 5}}>
                            <View style={{flex: 1}}>
                                {buyData.map((item, index) => {
                                    return (
                                        <View key={index} style={{height: 30, marginBottom: 3, width: (Metrics.screenWidth-50)/2, alignItems: 'flex-end'}}>
                                            <View style={{ backgroundColor: 'rgba(0,166,50,0.2)', height: 30, marginBottom: 3, width: (Metrics.screenWidth-50)/2*item.rate}}/>
                                            <View style={{position: 'absolute', height: 30, width: (Metrics.screenWidth-50)/2, flexDirection: 'row', alignItems: 'center',justifyContent: 'space-between'}}>
                                                <Text style={{fontSize: 12, color: Colors.blakText}}>{Number(item.amount).toFixed(4)}</Text>
                                                <Text style={{fontSize: 12, color: greenColor, marginRight: 2}}>{item.price}</Text>
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                            <View style={{width: 20}}/>
                            <View style={{flex: 1}}>
                                {sellData.map((item, index) => {
                                    return (
                                        <View key={index} style={{height: 30, marginBottom: 3, width: (Metrics.screenWidth-50)/2 }}>
                                            <View style={{ backgroundColor: 'rgba(255,50,50,0.2)', height: 30, marginBottom: 3, width: (Metrics.screenWidth-50)/2*item.rate}}/>
                                            <View style={{position: 'absolute', height: 30, width: (Metrics.screenWidth-50)/2, flexDirection: 'row', alignItems: 'center',justifyContent: 'space-between'}}>
                                                <Text style={{fontSize: 12, color: redColor, marginLeft: 2}}>{item.price}</Text>
                                                <Text style={{fontSize: 12, color: Colors.blakText}}>{Number(item.amount).toFixed(4)}</Text>
                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    </View>
                }
                {type === 1 &&
                    <View style={{paddingHorizontal: 15}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: Colors.greyText, height: 30}}>
                            <Text style={{flex: 1, fontSize: 12, color: Colors.greyText, textAlign: 'left'}}>时间</Text>
                            <Text style={{flex: 1, fontSize: 12, color: Colors.greyText, textAlign: 'center'}}>价格</Text>
                            <Text style={{flex: 1, fontSize: 12, color: Colors.greyText, textAlign: 'right'}}>数量</Text>
                        </View>
                        <View style={{}}>
                            {data.map((item, index) => {
                                const time = item.dealTime.split(' ')[1]
                                return (
                                    <View key={index} style={{flexDirection: 'row', alignItems: 'center', height: 30}}>
                                        <Text style={{flex: 1, fontSize: 12, color: Colors.blakText, textAlign: 'left'}}>{time}</Text>
                                        <Text style={{flex: 1, fontSize: 12, color: item.trendSide == 'SELL' ? redColor : greenColor, textAlign: 'center'}}>{item.price}</Text>
                                        <Text style={{flex: 1, fontSize: 12, color: Colors.blakText, textAlign: 'right'}}>{Number(item.amount).toFixed(4)}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                }
                {type === 2 &&
                    <View style={{padding: 15, minHeight: 300}}>
                        <Text>{`${dataDetail}`}</Text>
                    </View>
                }
            </View>
        );
    }
}
const styles = StyleSheet.create({
    unSelecedItem: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        borderBottomWidth: 3,
        borderBottomColor: Colors.White
    },
    selecedItem: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        borderBottomWidth: 3,
        borderBottomColor: Colors.main
    },
    unSelecedTxt: {
        fontSize: 14,
        color: Colors.blakText
    },
    selecedTxt: {
        fontSize: 14,
        color: Colors.main
    },
})
