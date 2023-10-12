import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform, Animated, TouchableOpacity, Image, } from 'react-native';
import { Header, Loading } from '../../components/Index';
import { Colors, Metrics } from '../../theme/Index';
import TDetailContent from '../digg/TDetailContent';
import { connect } from 'react-redux'

class AdDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info: null,
            title: '',
            isLoad: true,
            bottom: new Animated.Value(-156),
            opacity: new Animated.Value(0),
        };
    }
    componentDidMount() {
        this.reloadTopicData();
    }

    reloadTopicData() {
        let that = this;
        that.setState({
            info: this.props.info,
            title: this.props.title,
            thumbImage: this.props.thumbImage,
            bannerId: this.props.bannerId,
            isLoad: false
        })
    }
    /**
	 * HeaderRight点击事件
	 */
    onRightPress() {
        Animated.parallel([
            Animated.timing(this.state.bottom, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false
            }),
            Animated.timing(this.state.opacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: false
            }),
        ]).start();
    }
    /**
	 * 关闭分享Board
	 */
    closeShareBoard() {
        Animated.parallel([
            Animated.timing(this.state.bottom, {
                toValue: -156,
                duration: 400,
                useNativeDriver: false
            }),
            Animated.timing(this.state.opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false
            }),
        ]).start();
    }

    dispalyLoading() {
        if (this.state.info === null) {
            return (
                <View style={{ alignItems: "center", marginTop: 20 }}>
                    <Text>暂无数据</Text>
                </View>
            )
        }
        if (this.state.isLoad) {
            return (
                <Loading />
            )
        } else {
            return (
                <View>
                    <Header title={this.props.title ? this.props.title : ''} rightIconSize={20} onRightPress={() => this.onRightPress()} />
                    <View style={{ alignItems: "center", height: Metrics.screenHeight * 0.9 }}>
                        <TDetailContent TDContent={this.state.info} userId={this.props.userId} bannerId={this.state.bannerId} type="Ad" />
                    </View>
                </View>
            )
        }
    }
    render() {
        return (
            <View style={styles.container}>
                {this.dispalyLoading()}
            </View>
        );
    }
}
const mapStateToProps = state => ({
    userId: state.user.id,
    mobile: state.user.mobile,
    name: state.user.name
});
const mapDispatchToProps = dispatch => ({

})
export default connect(mapStateToProps, mapDispatchToProps)(AdDetail)
// 样式
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    shareContainer: { position: 'absolute', backgroundColor: Colors.C16, height: 156, left: 0, right: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
    shareHeader: { alignSelf: 'center', padding: 20, fontSize: 16, fontWeight: "400" },
    shareBody: { flexDirection: 'row', paddingTop: 20 },
    shareItem: { justifyContent: 'center', alignItems: 'center', paddingLeft: 20 },
    shareImage: { justifyContent: 'center', alignItems: 'center', width: 50, height: 50 },
    shareText: { marginTop: 6, color: Colors.White },
    shareFooter: { alignSelf: 'center', padding: 20 },
    shareFooterText: { fontSize: 16, fontWeight: "400", color: Colors.White },
})