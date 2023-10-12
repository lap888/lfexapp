import React, { Component, useCallback } from 'react';
import { Provider } from 'react-redux';
import * as WeChat from 'react-native-wechat-lib';
import { RootSiblingParent } from 'react-native-root-siblings';
import CreateStore from './redux/CreateStore';
import { PersistGate } from 'redux-persist/integration/react';
import Cookie from 'cross-cookie';
import Routers from './Routers';
import Advert from './view/screen/advert/Advert';
import { Platform } from 'react-native';

console.reportErrorsAsExceptions = false;
export default class App extends Component {

    componentDidMount() {

        // 微信分享注册
        WeChat.registerApp('wx7b42c1ef46624de5','yoyoba.cn');

        if (Platform.OS === 'android') {
            const callback = (res) => {
                if (res) {
                    Advert.showSplash()
                }
            }

            Advert.init(callback)

            Cookie.get('userId')
            .then(value => {
                if (value) {
                    Advert.setUserId(`s9${value}`)
                }
            })
        }
        
    }

    render() {
        let { store, persistor } = CreateStore();
        return (
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <RootSiblingParent>
                        <Routers />
                    </RootSiblingParent>
                </PersistGate>
            </Provider>
        );
    }
}
