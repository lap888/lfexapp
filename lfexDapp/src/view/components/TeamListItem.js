/*
 * @Author: top.brids 
 * @Date: 2019-12-24 22:56:12 
 * @Last Modified by: top.brids
 * @Last Modified time: 2020-09-19 23:05:51
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../theme/Index';
import { EncryptionMobile } from '../../utils/Index';

export default class TeamListItem extends Component {
    static propTypes = {
        item: PropTypes.object
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.item === this.props.item) {
            return false
        }
        return true
    }
    render() {
        let { item, index } = this.props;
        let { mobile, avatarUrl, name, teamCount, teamCandyH, contributions, auditState, teamStart, authCount } = item;
        if (!teamStart || teamStart < 0) teamStart = 0;
        return (
            <View style={Styles.bodyItem}>
                <View style={[Styles.avatar, { overflow: 'visible' }]}>
                    <Image style={Styles.avatar} source={{ uri: `${avatarUrl}` }} />
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {teamStart != 0 && <Text style={[Styles.teamStart]}>{`${teamStart}星达人`}</Text>}
                        {teamCount > 1 ?
                            <Text style={[Styles.phoneNumber]}>{`${mobile} `}</Text> :
                            <Text style={[Styles.phoneNumber]}>{`${EncryptionMobile(mobile)} `}</Text>
                        }
                        <Text style={Styles.phoneNumber}>{`${name}`}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={Styles.teamNumber}>{`团队人数 `}</Text>
                            <Text style={[Styles.teamNumber]}>{`${teamCount}`}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={[Styles.teamActivity]}>{`团队持币 `}</Text>
                            <Text style={[Styles.teamActivity, { flex: 1 }]}>{`${teamCandyH}`}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={Styles.teamNumber}>{`直推实名 `}</Text>
                            <Text style={[Styles.teamNumber, { flex: 1 }]}>{`${authCount}`}</Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            {auditState === 0 && <Text style={{ flex: 1, fontSize: 14, color: Colors.mainTab, fontWeight: '500' }}>未认证</Text>}
                            {auditState === 1 && <Text style={{ flex: 1, fontSize: 14, color: Colors.mainTab, fontWeight: '500' }}>审核中</Text>}
                            {auditState === 2 && <Text style={{ flex: 1, fontSize: 14, color: Colors.mainTab, fontWeight: '500' }}>已认证</Text>}
                            {auditState === 3 && <Text style={{ flex: 1, fontSize: 14, color: Colors.mainTab, fontWeight: '500' }}>未通过</Text>}
                            {auditState != 0 && auditState != 1 && auditState != 2 && auditState != 3 && <Text style={{ flex: 1, fontSize: 14, color: Colors.mainTab, fontWeight: '500' }}>未认证</Text>}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 4 }}>
                        <Text style={{ flex: 1, fontSize: 14, color: '#3c4d66' }}>{item.hasOwnProperty('ctime') ? "注册时间 " + item['ctime'] : ""}</Text>
                    </View>
                </View>
            </View>
        );
    }
}
const Styles = StyleSheet.create({
    bodyItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 15, paddingTop: 10, paddingBottom: 10, paddingRight: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eceff4' },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    phoneNumber: { fontSize: 14, color: '#3c4d66' },
    teamStart: { fontSize: 14, color: Colors.mainTab },
    teamNumber: { fontSize: 14, color: '#3c4d66' },
    teamActivity: { fontSize: 14, color: '#3c4d66' },
    isCertified: { textAlign: 'right', fontSize: 14, color: '#3c4d66' },
    sequence: { flexDirection: 'row', alignItems: 'center', margin: 10, marginTop: 15 },
    sequenceItem: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    sequenceTitle: { fontSize: 14, color: Colors.C11, textDecorationLine: 'underline' },
    dropup: { width: 9, height: 9 },
});
