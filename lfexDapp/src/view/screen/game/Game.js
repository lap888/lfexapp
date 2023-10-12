import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScrollTopBar, Header } from '../../components/Index';
import ClientGameList from './ClientGameList';
import { Colors, Metrics } from '../../theme/Index';
export default class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  renderHeader() {
    return (
      <Header title="游戏大厅" isTabBar={true} />
    )
  }
  renderScrollTab() {
    return (
      <ScrollTopBar
        topBarUnderlineStyle={{ backgroundColor: Colors.mainTab, width: 40, height: 3, borderRadius: 3 }}				                                                    // 下划线样式
        labelList={['全部', '棋牌', '角色', '传奇', '策略', '卡牌', '挂机', '经营', '休闲', '女生']}			// 标题栏素材
        topBarInactiveTextColor='#666666'		                                              // label 文字非选中颜色
        topBarActiveTextColor={Colors.mainTab}	                                                // label 文字选中颜色
        topBarBackgroundColor="#FFFFFF"	                                                // 背景颜色
      >
        <ClientGameList type={0} />
        <ClientGameList type={1} />
        <ClientGameList type={2} />
        <ClientGameList type={3} />
        <ClientGameList type={4} />
        <ClientGameList type={5} />
        <ClientGameList type={6} />
        <ClientGameList type={7} />
        <ClientGameList type={8} />
        <ClientGameList type={9} />
      </ScrollTopBar>
    )
  }
  render() {
    return (
      <View style={Styles.container}>
        {this.renderHeader()}
        {this.renderScrollTab()}
      </View>
    );
  }
}
const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  }
});
