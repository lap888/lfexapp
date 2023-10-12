/*
 * @Author: top.brids 
 * @Date: 2019-12-27 10:12:36 
 * @Last Modified by: top.brids
 * @Last Modified time: 2020-09-16 18:34:31
 */

import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BoxShadow } from 'react-native-shadow';
import moment from 'moment';
import { Colors, Metrics } from '../theme/Index';
import PropTypes from 'prop-types';

export default class CandyListItem extends PureComponent {
    static propTypes = {
        item: PropTypes.object
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        let { item, index } = this.props;
        const shadowOpt = {
            height: 70,
            width: Metrics.screenWidth - 20,
            color: Colors.mainTab,
            border: 2,
            radius: 6,
            opacity: 0.5,
            x: 0,
            y: 0,
            style: Styles.transactionContainer
        }
        return (
            item ?
                <BoxShadow setting={shadowOpt}>
                    <View style={Styles.diamondCard}>
                        <View style={[Styles.labelView]}>
                            <Text style={Styles.labelTxt}>
                                {item.description || "收益"}
                            </Text>
                            <Text style={Styles.diamondTime}>
                                {item.createdAt}
                            </Text>
                        </View>
                        <View style={[Styles.diamondNumView]}>
                            {item.num > 0 ? <Text style={Styles.diamondNumTxt}> +{item.num.toFixed(2)} </Text> : <Text style={Styles.diamondNumTxt2}> {item.num < 0 ? item.num.toFixed(2) : "0.00"} </Text>}
                        </View>
                    </View>
                </BoxShadow>
                : <View />
        );
    }
}

const Styles = StyleSheet.create({
    transactionContainer: { left: 10, marginTop: 10 },
    verticalLine: { height: 35, width: 3, borderRadius: 3, backgroundColor: Colors.C1 },
    diamondCard: {
        height: 65,
        margin: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.C8,
        borderRadius: 6
    },
    labelView: {
        flex: 1,
        marginLeft: 12,
    },
    labelTxt: { fontSize: 14, color: Colors.C0, fontWeight: '400' },
    diamondTime: { marginTop: 8, fontSize: 13, color: Colors.C2 },
    diamondNumView: {
        alignItems: "flex-end"
    },
    diamondNumTxt: {
        fontSize: 14,
        color: Colors.mainTab,
        flexWrap: "wrap",
        marginRight: 10
    },
    diamondNumTxt2: {
        fontSize: 14,
        color: Colors.C16,
        flexWrap: "wrap",
        marginRight: 10
    },
});