import React, { Component } from 'react';
import { View, Image, Platform, StyleSheet, InteractionManager, Linking, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
// import { Toast } from 'native-base';
import { GameList, TodayAn } from '../../components/Index';
import { Colors } from '../../theme/Index';
import { Send } from '../../../utils/Http';
import { Toast } from '../../common';
import { upgrade } from 'rn-app-upgrade';
import { Actions } from 'react-native-router-flux';
import Cookie from 'cross-cookie';
export default class ClientGameList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameList: [],
            currentPage: 1,
            totalPage: 1,
            firstLoading: true,
            loadingMore: false,
            recommendation: {},
            bannerList: []
        }

    }
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.fetchFirstGame(this.props.type);
            this.fetchList(this.state.currentPage);
            if (this.props.type === 0) this.fetchBanner(1);
        });
    }
    /**
     * 获取游戏Banner列表
     * @param {*} source 
     */
    fetchBanner(source) {
        var that = this;
        Send("api/system/banners?source=" + source, {}, 'GET').then(res => {
            if (res.code == 200) {
                that.setState({ bannerList: res.data });
            } else {
                Toast.tipBottom(res.message)
                // Toast.show({
                //     text: res.message,
                //     textStyle: { color: '#FFFFFF', textAlign: 'center' },
                //     position: "bottom",
                //     duration: 2000
                // });
            }
        })
    }
    /**
     * 首发游戏获取
     */
    fetchFirstGame(type) {
        var that = this;
        Send(`api/Game/FristGame?type=${type}&platform=${Platform.OS}`, {}, 'get').then(res => {
            if (res.code == 200) {
                that.setState({ recommendation: res.data });
            }
        });
    }
    /**
     * 获取游戏列表信息
     * @param {*} page 
     */
    fetchList(page) {
        this.setState({ currentPage: page });
        var that = this;
        Send("api/Game/GameList", { type: this.props.type, pageIndex: page, platform: Platform.OS }).then(res => {
            if (that.state.firstLoading) that.setState({ firstLoading: false });
            if (that.state.loadingMore) that.setState({ loadingMore: false });

            if (res.code == 200) {
                // 初始化
                if (page === 1) {
                    that.setState({ gameList: res.data, totalPage: res.recordCount });
                } else {
                    let gameListTemp = [...that.state.gameList];
                    that.setState({ gameList: gameListTemp.concat(res.data), totalPage: res.recordCount });
                }
            } else {
                Toast.tipBottom(res.message)
                // Toast.show({
                //     text: res.message,
                //     textStyle: { color: '#FFFFFF', textAlign: 'center' },
                //     position: "bottom",
                //     duration: 2000
                // });
            }
        });
    }

    onPressSwiper = (item) => {
        if (item.type == 1) {
            let params = JSON.parse(item.params)
            Linking.openURL(params.url)
        } else if (item.type == 2) {
            let params = JSON.parse(item.params)
            Toast.show({
                text: '正在下载...',
                textStyle: { color: '#FFFFFF', textAlign: 'center' },
                position: "top",
                duration: 2000
            });
            upgrade(params.url);
        } else if (item.type == 3) {
            let params = JSON.parse(item.params);
            Actions.AdH5({ url: params.url, ty: 3, title: item.title, thumbImage: item.imageUrl, bannerId: item.id });
        } else if (item.type == 4) {
            Toast.show({
                text: `暂时不能操作哦 ${item.type}`,
                textStyle: { color: '#FFFFFF', textAlign: 'center' },
                position: "top",
                duration: 2000
            });
            // let params = JSON.parse(item.params);
            // let url = params.url;
            // //处理url
            // let p1 = '{YoyoUserMobilePhone}';
            // let p2 = '{YoyoUserID}';
            // if (url.indexOf(p1) > 0) {
            //     url = url.replace(p1, this.props.mobile)
            // }
            // if (url.indexOf(p2) > 0) {
            //     url = url.replace(p2, this.props.userId)
            // }
            // Actions.AdH5({ url: url, ty: 4, title: item.title, thumbImage: item.imageUrl, bannerId: item.id });
        } else if (item.type == 5) {
            let params = JSON.parse(item.params);
            let url = params.url;
            Cookie.get('token')
                .then(value => {
                let token = value == null || value == '' ? '' : value;
                Actions.AdReward({ url: url, ty: 5, title: item.title, thumbImage: item.imageUrl, bannerId: item.id, token: token });
                });
        } else if (item.type == 6) {
            let params = JSON.parse(item.params);
            Actions.AdH5({ url: params.url, ty: 6, title: item.title, thumbImage: item.imageUrl, bannerId: item.id });
        } else {
            Actions.AdDetail({ info: item.params, title: item.title, thumbImage: item.imageUrl, bannerId: item.id });
        }
    }

    /**
     * 渲染游戏轮播图
     */
    renderSwiper() {
        if (this.props.type !== 0) return <View />;
        return (
            <View style={Styles.cardItemForGraph}>
                <Swiper
                    key={this.state.bannerList.length}
                    loop={true}
                    horizontal={true}
                    autoplay={true}
                    autoplayTimeout={4}
                    paginationStyle={{ bottom: 5 }}
                    showsButtons={false}
                    activeDotStyle={{ width: 15, height: 3, backgroundColor: Colors.White, borderRadius: 1 }}
                    dotStyle={{  width: 15, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 }}>
                    {this.state.bannerList.map(item =>
                        <TouchableOpacity key={item['id'].toString()} onPress={() => this.onPressSwiper(item)}>
                            <Image
                                // key={item['id'].toString()}
                                source={{ uri: item['imageUrl'] }}
                                style={Styles.img}
                            />
                        </TouchableOpacity>
                    )}
                </Swiper>
            </View>
        )
    }
    /**
     * 渲染列表Header
     */
    renderHeader() {
        return (
            <View>
                {this.renderSwiper()}
                <TodayAn>{this.state.recommendation}</TodayAn>
            </View>
        )
    }
    render() {
        let { gameList, firstLoading, loadingMore, currentPage, totalPage } = this.state;
        return (
            <View style={Styles.container}>
                <GameList
                    data={gameList}
                    firstLoading={firstLoading}
                    loadingMore={loadingMore}
                    currentPage={currentPage}
                    totalPage={totalPage}
                    ListHeaderComponent={this.renderHeader()}
                    fetchList={page => this.fetchList(page)}
                />
            </View>
        );
    }
}
const Styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    img: {
        height: '100%',
        width: '100%',
        borderRadius: 5,
    },
    cardItemForGraph: {
        height: 150,
        margin: 5,
        flexDirection: "row",
        overflow: "hidden"
    },
});