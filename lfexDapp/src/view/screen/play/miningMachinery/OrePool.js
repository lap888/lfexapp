import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Pressable, SafeAreaView  } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Ionicons';
import { Coin } from '../../../../api';
import { Send } from '../../../../utils/Http';
import { Loading, RegExp, Toast } from '../../../common';
import { Header } from '../../../components/Index';
import { Colors } from '../../../theme/Index';
const saveDate = [
    {key: 1, time: '活期存取'},
    {key: 2, time: '30天'},
    {key: 3, time: '60天'},
    {key: 4, time: '90天'},
]
export default class OrePool extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 0,
            suoNum: '',
            expectPrice: 0.00,
            ischeck: false,
            isLoading: true,
            data: {
                "cTime": "", 
                "id": 0, 
                "income": 0, 
                "name": "", 
                "remark": "自锁仓开始，T+1日起，计算收益，锁仓收益每日23点发放，赎回需要一天时间。", 
                "type": -1
            },
            list:[]
        };
    }

    componentDidMount() {
        Coin.lookUpIncomeSetting()
        .then((data) => {
            this.setState({
                data: data[0],
                list: data,
                isLoading: false
            })
        }).catch((err) => this.setState({ isLoading: false }))
    }

    setSuoNum = (value) => {
        if (RegExp.integer1.test(value) || value === '') {
            this.setState({
                suoNum: value,
                expectPrice: (this.state.data.income/365 * Number(value)).toFixed(4),
            })
        }
        return;
    }
    /**
     * 进入《锁仓挖矿协议》
     */
    onCommonRules() {
        Send(`api/system/CopyWriting?type=look_up_rele`, {}, 'get').then(res => {
            Actions.push('CommonRules', { title: '锁仓挖矿协议', rules: res.data });
        });
    }
    
    selcetTime = (item) => {
        this.setState({ 
            data: item 
        },() => this.setState({ expectPrice: (this.state.data.income/365 * Number(this.state.suoNum)).toFixed(4) }) )

    }

    confirm = () => {
        const { data, suoNum } = this.state;
        Coin.confirmLookUp(data.type, suoNum)
        .then((data) => {
            Toast.tip('锁仓成功');
            this.setState({ isLoading: false })
        }).catch((err) => this.setState({ isLoading: false }))
    }

    render() {
        const { list, data, suoNum, expectPrice, ischeck, isLoading } = this.state; 
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
                <Header title={'LF锁仓挖矿'} rightText={'订单'} onRightPress={() => Actions.push('OrePoolOrderList')}/>
                <View style={{backgroundColor: Colors.main, height: 120, alignItems: 'center'}}>
                    <Text style={{color: Colors.White, fontSize: 12, marginTop: 10 }}>预期收益  (LF)</Text>
                    <Text style={{color: Colors.White, fontSize: 30, marginTop: 10 }}>{expectPrice}</Text>
                    <Text style={{color: Colors.White, fontSize: 12, marginTop: 5 }}>≈{data.income}%  预期年化收益率</Text>
                </View>
                <View style={{height: 50, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.White, paddingHorizontal: 15}}>
                    <Text style={{fontSize: 15}}>锁仓数量  </Text>
                    <TextInput
                        style={{flex: 1, fontSize: 16, padding: 0 }}
                        placeholder={'10  LF 起'}
                        keyboardType={'number-pad'}
                        onChangeText={this.setSuoNum}
                        value={suoNum}
                    />
                </View>
                <View style={{marginTop: 10, backgroundColor: Colors.White, paddingHorizontal: 15}}>
                    <Text style={{fontSize: 15, marginVertical: 10}}>锁仓期限</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        {list.map((item) => {
                            return (
                                <TouchableOpacity style={data.id === item.id ? styles.selected : styles.unSelected} onPress={() => this.selcetTime(item)}>
                                    <Text style={{fontSize: 13, color: data.id === item.id ? Colors.main : Colors.greyText}}>{item.name}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    <View style={{flexDirection: 'row', paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.backgroundColor}}>
                        <Icon name={'information-circle-outline'} size={16} color={Colors.main}/>
                        <Text style={{marginRight: 10, fontSize: 12}}>{data.remark}</Text>
                    </View>
                </View>
                <View style={{flex: 1}}/>
                <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
                    <Pressable onPress={() => this.setState({ischeck: !ischeck})}>
                        <Icon name={ischeck ? 'checkbox' : 'checkbox-outline'} size={16} color={Colors.main}/>
                    </Pressable>
                    <Text style={{fontSize: 12}}>同意<Text style={{color: Colors.main}} onPress={this.onCommonRules}>《锁仓挖矿协议》</Text>, 并知晓页面展示预期收益不代表实际收益承诺</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.btn, {backgroundColor: suoNum != '' && ischeck ? Colors.main : Colors.greyText}]}
                    disabled={suoNum != '' && ischeck ? false : true} 
                    onPress={this.confirm}>
                    <Text style={{color: Colors.White}}>确定锁仓</Text>
                </TouchableOpacity>
                {isLoading && <Loading/>}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    selected: {
        paddingHorizontal: 15,
        paddingVertical: 3,
        marginRight: 10,
        marginBottom: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.main,
    },
    unSelected: {
        paddingHorizontal: 15,
        paddingVertical: 3,
        marginRight: 10,
        marginBottom: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.greyText,
    },
    btn: {
        height: 40,
        marginHorizontal: 20,
        borderRadius: 5,
        marginTop: 5,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: Colors.main
    },
})