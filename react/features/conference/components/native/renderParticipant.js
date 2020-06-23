import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '../../../base/avatar';

const renderParticipant = (props) => {
    return (
        <View style={{ flexDirection: 'row', marginVertical: 8 }}>
            <Avatar participantId={props.participant.id} size={24} />
            <Text style={{ fontSize: 16, marginHorizontal: 8 }}>
                {props.participant.name ? props.participant.name : 'Nameless customer'}
            </Text>
        </View>
    );
};

export default renderParticipant;
