import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import ByronKlineChart, {
    dispatchByronKline,
    KLineIndicator,
    CandleHollow,
} from 'react-native-kline';
import { Coin } from '../../../../api';
import { Send } from '../../../../utils/Http';
import { Colors } from '../../../theme/Index';

const BaseUrl = 'http://dev.52expo.top/api/Coin';
const WsUrl = 'ws://49.233.210.12:1998/websocket';

const TIME = [
    { key: 0, text: '分时' },
    { key: 1, text: '15分钟' },
    { key: 2, text: '30分钟' },
    { key: 3, text: '1小时' },
    { key: 4, text: '1天' },
    { key: 5, text: '1个月' },
]
export default class KLine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datas: [],
            symbol: 'BTCUSDT',
            selectTime: { key: 0, text: '分时' },
            pageIndex: 0,
            pageSize: 0
        };
        this.coinType = this.props.coinType,
        this.ws = null;
    }

    componentDidMount() {
        this.initKlineChart(this.coinType);
        // this.ws = new WebSocket(WsUrl);
        // this.ws.onopen = this.onWebSocketOpen;
        // this.ws.onmessage = this.onWebSocketMessage;
    }
    shouldComponentUpdate(nextProps) {
        if (this.props.coinType != nextProps.coinType) {
            this.coinType = nextProps.coinType,
            this.initKlineChart(nextProps.coinType);
        }
        return true;
    }
    onMoreKLineData = async (params) => {
        console.log(' >> onMoreKLineData :', params);
        const { symbol } = this.state;
        const res = await Send(`${BaseUrl}/kline?type=${this.coinType}&symbol=${symbol}&to=${params.id}`, '', 'Get');
        if (!res || !res.data) {
            return;
        }
        dispatchByronKline('add', res.data);
    };

    initKlineChart = async (coinType) => {
        const { selectTime, pageIndex, pageSize } = this.state;
        await Coin.KLine({ Type: selectTime.key, CoinType: coinType, PageIndex: pageIndex, PageSize: pageSize })
        .then((data) => {
            this.setState({ datas: data });
        }).catch((err) => console.log('err', err))
    }

    subscribeKLine = (event = 'subscribe') => {
        if (!this.ws) {
            return;
        }
        const { coinType, symbol } = this.state;
        const data = {
            event: event,
            data: `${coinType}/${symbol}`,
        };
        this.ws.send(JSON.stringify(data));
    };

    onWebSocketOpen = () => {
        this.subscribeKLine();
    };

    onWebSocketMessage = (evt) => {
        // console.log(' >> onWebSocketMessage:', evt.data);
        const { coinType, symbol } = this.state;
        const msg = JSON.parse(evt.data);
        const _type = `${type}/${symbol}`;
        if (!msg || msg.type !== _type || !msg.data) {
            return;
        }
        dispatchByronKline('update', [msg.data]);
    };

    handleTime = (item) => {
        this.setState({selectTime: item}, () => {
            this.initKlineChart(this.coinType);
        })
    }
    render() {
        const { selectTime } = this.state;
        return (
            <View style={styles.container}>
                <View style={{flexDirection: 'row', height: 35, backgroundColor: Colors.White, marginBottom: 5}}>
                    {/* <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 12}}>分时</Text>
                    </View> */}
                    {TIME.map((item, index) => {
                        return (
                            <TouchableOpacity key={index} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} onPress={() => this.handleTime(item)}>
                                <Text style={{fontSize: 12, color: selectTime.key === item.key ? Colors.main : Colors.blakText}}>{item.text}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <ByronKlineChart
                    style={{ height: 250 }}
                    datas={this.state.datas}
                    // onMoreKLineData={this.onMoreKLineData}
                    indicators={[KLineIndicator.MainMA, KLineIndicator.VolumeShow]}
                    // limitTextColor={'#FF2D55'}
                    // mainBackgroundColor={'#ffffff'}
                    // candleHollow={CandleHollow.NONE_HOLLOW}
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColor,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});