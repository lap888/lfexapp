import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Header, ScrollTopArea } from '../../components/Index';
import Colors from '../../theme/Colors';
import SystemMessage from './SystemMessage';
import MyMessage from './MyMessage';

export default class Message extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    headerView() {
        if (this.props.idx == 0) {
            return (
                <Header title="公告" />
            )
        }
        return (
            <Header title="公告" />
        )
    }
    /**
     * 渲染交易TopBar                        
     */
    renderTransaction() {
        return (
            <ScrollTopArea
                labelList={['系统', '我的']}
                initinalIndex={this.props.idx}
                topBarInactiveTextColor='#FFFFFF'
                topBarActiveTextColor="#FFFFFF"
                topBarActiveBackgroundColor={Colors.mainTab}
                topBarInactiveBackgroundColor="#666666"
                topBar="#666666"
                onChange={e => this.setState({ index: e })}
            >
                <SystemMessage isFocus={this.state.index === 0} />
                <MyMessage isFocus={this.state.index === 1} />
            </ScrollTopArea>
        )
    }

    render() {
        return (
            <View style={Styles.container}>
                {this.headerView()}
                {this.renderTransaction()}
            </View>
        );
    }
}
const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    }
});
