import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Metrics, Colors } from '../../../theme/Index';
import { ScrollTopBar } from '../../../components/Index';
import IncreaseRank from './IncreaseRank';
import DeclineRank from './DeclineRank';
import DealRank from './DealRank';

export default class HomeRank extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: '涨幅榜',
            index: -1
        };
        this.selectTitle = [
            {
                name: '涨幅榜'
            },
            {
                name: '跌幅榜'
            },
            {
                name: '成交榜'
            }
        ]
    }

    select = (item) => {
        console.warn('123');
        this.setState({
            selected: item.name
        })
    }
    render() {
        const { data } = this.props;
        return (
            <View style={{flex: 1}}>
                <View style={{flex: 1}}>
                    <ScrollTopBar
                        borderBottom={true}
                        topBarUnderlineStyle={{ backgroundColor: Colors.mainTab, width: 30, height: 3, marginLeft: this.state.index === -1 ? 15 : 0, borderRadius: 1 }}
                        itemStyles={{padding: 15}}				                                                    // 下划线样式
                        labelList={['涨跌榜', '新币榜', '成交榜']}			// 标题栏素材
                        textStyles={{ fontSize: 16, fontWeight: 'bold',}}
                        topBarInactiveTextColor='#666666'		         // label 文字非选中颜色
                        topBarActiveTextColor={Colors.mainTab}	         // label 文字选中颜色
                        topBarBackgroundColor="#FFFFFF"	                 // 背景颜色
                        onChange={e => this.setState({ index: e })}
                    >
                        <IncreaseRank isFocus={this.state.index === 0} />
                        <DeclineRank isFocus={this.state.index === 1} />
                        <DealRank isFocus={this.state.index === 2} />
                    </ScrollTopBar>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    titlev: {
        width: Metrics.screenWidth, 
        height: 40,
        flexDirection: 'row',
        borderBottomColor: Colors.LightGrey,
        borderBottomWidth: 1
    },
    item: {
        flex: 1, 
        width: Dimensions.get('window').width / 4, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    txtTop: {
        fontSize: 16, 
        fontWeight: 'bold',
        color: Colors.C10
    },
    activeTxtTop: {
        fontSize: 16, 
        fontWeight: 'bold', 
        color: Colors.C11
    },
    txtBottom: {
        fontSize: 12, 
        fontWeight: 'normal', 
        marginTop: 3
    },
    activeTxtBottom: {
        fontSize: 12, 
        fontWeight: 'normal', 
        color: Colors.main,
    },
    activeTxtView: {
        height: 20,
        paddingHorizontal: 5,
        backgroundColor: Colors.main,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    txtView: {
        height: 20,
        paddingHorizontal: 5,
        backgroundColor: Colors.main,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    }
})
