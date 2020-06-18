import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '../../../base/avatar';

const renderParticipant = (props) => {
    return (
        <View style={{ flexDirection: 'row' }}>
            <Avatar participantId={props.participant.id} size={100} />
            <Text style={{ fontSize: 16 }}>
                {props.participant.name ? props.participant.name : 'Nameless customer'}
            </Text>
        </View>
    );
};

export default renderParticipant;
