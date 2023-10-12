import React, { Component } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, StatusBar, Platform, Image } from 'react-native';
import * as PropTypes from 'prop-types';
import Icon from "react-native-vector-icons/FontAwesome";
import { Actions } from 'react-native-router-flux';
import * as Metrics from '../theme/Metrics';
import * as Colors from '../theme/Colors';

export default class Header extends Component {
    static propTypes = {
        title: PropTypes.string,                // Header标题
        titleStyle: PropTypes.oneOfType([       // Header标题样式
            PropTypes.number,
            PropTypes.object
        ]),

        leftIcon: PropTypes.string,             // HeaderLeft图标
        leftIconSize: PropTypes.number,         // HeaderLeft图标大小
        leftText: PropTypes.string,             // HeaderLeft文字
        leftImageHttpUrl: PropTypes.string,
        onLeftPress: PropTypes.func,            // HeaderLeft点击事件
        leftStyle: PropTypes.oneOfType([        // HeaderLeft样式
            PropTypes.number,
            PropTypes.object
        ]),

        rightIcon: PropTypes.string,            // HeaderRight图标
        rightIconSize: PropTypes.number,        // HeaderRight图标大小
        rightText: PropTypes.string,            // HeaderRight文字
        onRightPress: PropTypes.func,           // HeaderRight点击事件
        rightStyle: PropTypes.oneOfType([       // HeaderRight样式
            PropTypes.number,
            PropTypes.object
        ]),

        style: PropTypes.oneOfType([            // HeaderRight样式
            PropTypes.number,
            PropTypes.object
        ]),
        barStyle: PropTypes.string,
        statusBarBackgroundColor: PropTypes.string,     // StatusBar背景色
        backgroundColor: PropTypes.string,

        isTabBar: PropTypes.bool,               // 是否为Tab界面
    };
    static defaultProps = {
        title: "",
        titleStyle: {},

        leftIcon: "angle-left",
        leftIconSize: 30,
        leftText: "",
        leftIconColor: '#ffffff',
        leftImageHttpUrl: "",
        leftStyle: {},
        leftImgStyle: {},
        onLeftPress: () => Actions.pop(),

        rightIcon: "",
        rightIconSize: 30,
        rightText: "",
        rightStyle: {},
        onRightPress: () => { },

        style: {},
        barStyle: 'dark-content',
        statusBarBackgroundColor: Colors.mainTab,
        backgroundColor: Colors.mainTab,

        isTabBar: false
    };
    /**
     * HeaderLeft点击事件
     */
    onLeftPress() {
        if (!this.props.isTabBar) {
            this.props.onLeftPress();
        }
    }

    /**
     * 渲染HeaderLeft
     */
    renderHeaderLeft() {
        let { leftIcon, leftText, leftImageHttpUrl, leftIconSize, leftStyle, leftImgStyle, leftIconColor, onLeftPress, isTabBar } = this.props;

        return (
            <TouchableWithoutFeedback onPress={() => this.onLeftPress()}>
                <View style={Styles.leftContainer}>
                    {!isTabBar ?
                        (leftImageHttpUrl ?
                            /^http(s*)/.test(leftImageHttpUrl) ?
                                <Image source={{ uri: leftImageHttpUrl }} style={[Styles.leftImageStyle, leftImgStyle]} /> :
                                <Image source={require('../images/lfex_logo.png')} style={[Styles.leftImageStyle, leftImgStyle]} /> :
                            leftText ?
                                <Text style={[Styles.leftStyle, leftStyle]}>{leftText}</Text>
                                :
                                <Icon name={leftIcon} size={leftIconSize} color={leftIconColor} />
                        )
                        : <View />
                    }
                </View>
            </TouchableWithoutFeedback>
        )
    }

    /**
     * 渲染HeaderTitle
     */
    renderHeaderTitle() {
        let { title, titleStyle } = this.props;
        return (
            <View style={Styles.titleContainer}>
                <Text style={[Styles.titleStyle, titleStyle]}>{title}</Text>
            </View>
        )
    }

    /**
     * 渲染HeaderRight
     */
    renderHeaderRight() {
        let { rightIcon, rightIconSize, rightText, rightStyle, onRightPress } = this.props;
        return (
            <TouchableWithoutFeedback onPress={() => onRightPress()}>
                <View style={Styles.rightContainer}>
                    {rightText ?
                        <Text style={[Styles.rightStyle, rightStyle]}>{rightText}</Text>
                        :
                        (rightIcon ?
                            <Icon name={rightIcon} size={rightIconSize} color="#FFFFFF" />
                            :
                            <View />
                        )
                    }
                </View>
            </TouchableWithoutFeedback>
        )
    }

    /**
     * 渲染StatusBar
     */
    renderStatusBar() {
        return (
            <StatusBar backgroundColor={this.props.statusBarBackgroundColor} barStyle={'dark-content'} />
        )
    }

    render() {
        return (
            <View style={[Styles.container, { backgroundColor: this.props.backgroundColor }]}>
                {this.renderStatusBar()}
                {this.renderHeaderLeft()}
                {this.renderHeaderTitle()}
                {this.renderHeaderRight()}
            </View>
        );
    }
}
const Styles = StyleSheet.create({
    container: { paddingTop: Metrics.STATUSBAR_HEIGHT, height: Metrics.HEADER_HEIGHT, width: Metrics.screenWidth, backgroundColor: Colors.titleMain, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    titleContainer: { flex: 4, justifyContent: 'center', alignItems: 'center' },
    titleStyle: { fontSize: 18, color: '#FFFFFF', fontWeight: 'normal' },
    leftContainer: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 16, paddingRight: 16 },
    leftStyle: { fontSize: 16, color: '#FFFFFF', fontWeight: 'normal' },
    leftImageStyle: { width: 40, height: 40, borderRadius: 30, borderWidth: 0.5, borderColor: Colors.C8 },
    rightContainer: { flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingLeft: 16, paddingRight: 16 },
    rightStyle: { fontSize: 16, color: '#FFFFFF', fontWeight: 'normal' },
});
