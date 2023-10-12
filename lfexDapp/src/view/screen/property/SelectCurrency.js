import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from '../../components/Index';
import { Colors } from '../../theme/Index';
import { Actions } from 'react-native-router-flux';
import { Coin } from '../../../api';
import { Toast } from '../../common';

export default class SelectCurrency extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            type: props.type,
        };
    }

    componentDidMount() {
        this.getCoinType()
    }

    getCoinType = () => {
        Coin.getCoinType()
        .then((data) => {
            this.setState({
                data: data
            })
        }).catch((err) => console.log('err', err))
    }

    goWithdraw = (data) => {
        if (this.state.type == 'tibi' && data.status == 1) {
            Actions.push('WithdrawMoney', {data});
            return ;
        }if (this.state.type == 'chongbi' && data.cstatus == 1) {
            Actions.push('RechargeMoney', {data})
            return ;
        }
        Toast.tip('暂未开放')
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <Header title={'选择币种'} />
                <View style={{flex: 1}}>
                    {   
                        this.state.data.map((item, index) => {
                            return (
                                <TouchableOpacity key={index} style={styles.item} onPress={()=> this.goWithdraw(item)}>
                                    <Text style={{fontSize: 16, color: Colors.C11, fontWeight: 'normal'}}>{item.name}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    item: {
        height: 55, 
        justifyContent: 'center', 
        paddingHorizontal: 20, 
        borderBottomWidth: 1, 
        borderBottomColor: Colors.C13
    },
})