import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { ScrollTopArea, Header } from '../../components/Index';
import { Colors } from '../../theme/Index';
import CollegeFAQList from '../play/CollegeFAQList';

export default class College extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <Header title="新手指南" />
                <ScrollTopArea
                    labelList={['问答', '视频']}
                    topBarInactiveTextColor='#FFFFFF'
                    topBarActiveTextColor="#FFFFFF"
                    topBarActiveBackgroundColor={Colors.mainTab}
                    topBarInactiveBackgroundColor="#666666"
                    topBarBackgroundColor="#FFFFFF"
                    topBar="#666666"
                    onChange={e => this.setState({ index: e })}
                >
                    <CollegeFAQList type="fqa" isFocus={this.state.index === 0} />
                    <CollegeFAQList type="video" isFocus={this.state.index === 1} />
                </ScrollTopArea>
            </View>
        );
    }
}
