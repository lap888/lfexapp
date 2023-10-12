import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Coin } from '../../../../api';
import { Loading, Toast } from '../../../common';
import { Header } from '../../../components/Index';
import SelectTopTab from '../../../components/SelectTopTab';
import { Colors } from '../../../theme/Index';

const TOPTABLIST = [
    {key: 0, name: '矿机商店'},
    {key: 1, name: '过期矿机'}
]
export default class MiningMachineryShop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tasksList: [],
            selectTap: 0,
            isLoading: true
        };
    }

    componentDidMount() {
        this.getTasksList(0)
    }

    getTasksList = (status) => {
        Coin.getTasksShop(status)
        .then((data) => {
            this.setState({
                tasksList: data,
                isLoading: false
            })
        }).catch((err) => this.setState({ isLoading: false }) )
    }

    exchange = (mid) => {
        this.setState({isLoading: true}, () => {
            Coin.exchange(mid)
            .then((data) => {
                Toast.tip('兑换成功');
                this.setState({isLoading: false})
            }).catch((err) => this.setState({isLoading: false}))
        })
    }

    selectTab = (item) => {
        this.setState({selectTap: item.key})
        this.getTasksList(item.key)
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
                <Header title={'矿机'} />
                <SelectTopTab list={TOPTABLIST} onPress={this.selectTab} />
                <ScrollView style={{flex: 1}}>
                    { this.state.tasksList.length > 0 && this.state.tasksList.map((item, index) => {
                        return (
                            <View key={index} style={{ backgroundColor: Colors.White, marginTop: 10, height: 140, borderRadius: 5, marginHorizontal: 15 }}>
                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                    <View style={styles.toptn}>
                                        <Text style={styles.topText}>名称</Text>
                                        <Text style={styles.topNum}>{item.minningName}</Text>
                                    </View>
                                    <View style={styles.toptn}>
                                        <Text style={styles.topText}>算力(日产量)</Text>
                                        <Text style={styles.topNum}>{item.pow}</Text>
                                    </View>
                                    <View style={styles.toptn}>
                                        <Text style={styles.topText}>期限</Text>
                                        <Text style={styles.topNum}>{item.runTime}</Text>
                                    </View>
                                    <View style={styles.toptn}>
                                        <Text style={styles.topText}>产量</Text>
                                        <Text style={styles.topNum}>{item.candyOut}</Text>
                                    </View>
                                </View>
                                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                    {this.state.selectTap === 0 &&
                                        <TouchableOpacity style={[styles.btn, { backgroundColor: item.colors }]} onPress={() => this.exchange(item.minningId)}>
                                            <Text style={{ fontSize: 16, color: Colors.White }}>兑换</Text>
                                            <Text style={{ fontSize: 10, color: Colors.White }}>兑换所需要LF: {item.candyIn}</Text>
                                        </TouchableOpacity>}
                                    {this.state.selectTap === 1 &&
                                        <View style={styles.btn}>
                                            <Text style={{ fontSize: 16, color: Colors.White }}>矿机已过期</Text>
                                        </View>}
                                </View>
                                <View style={{marginLeft: 10, marginTop: 5}}>
                                    <Text style={{ fontSize: 10, color: Colors.greyText }}>最大持有数量: {item.maxHave} 个</Text>
                                </View>
                                <View style={[styles.areaChoice, { borderTopColor: item.colors, borderLeftColor: item.colors, borderRightColor: item.colors}]}/>
                            </View>
                        )
                    }) }
                    <View style={{height: 20}}/>
                </ScrollView>
                {this.state.isLoading && <Loading/>}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    toptn: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingVertical: 10
    },
    topText: {
        color: Colors.greyText, 
        fontSize: 13
    },
    topNum: {
        color: Colors.blakText, 
        fontSize: 15
    },
    btn: { 
        width: 170, 
        height: 45, 
        borderRadius: 22.5, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: Colors.greyText
    },
    areaChoice: {
        position: 'absolute',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: 8,
        borderTopColor: '#999',
        borderLeftColor: '#999',
        borderBottomColor: '#fff',
        borderRightColor: '#999',
        marginLeft: 8,
    },
})
