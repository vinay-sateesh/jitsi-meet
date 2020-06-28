import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { openDialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { IconMenuThumb } from '../../../base/icons';
import { connect } from '../../../base/redux';
import { AbstractButton } from '../../../base/toolbox';
import type { AbstractButtonProps } from '../../../base/toolbox';
import OverflowMenu from './OverflowParticipants';

type Props = AbstractButtonProps & {
    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,
    /**
     * Get no. of participants in the conference
     */
    count: number,
};
class ParticipantCount extends AbstractButton<Props, *> {
    /**
     * Handles clicking / pressing this {@code OverflowMenuButton}.
     *
     * @protected
     * @returns {void}
     */
    _handleClick = () => {
        console.log('clicked');
        this.props.dispatch(openDialog(OverflowMenu));
    };
    render() {
        return (
            <TouchableOpacity onPress={this._handleClick}>
                <View
                    style={{
                        borderWidth: 1,
                        borderColor: 'white',
                        paddingHorizontal: 4,
                        borderRadius: 8,
                        marginHorizontal: 4
                    }}
                >
                    <Text style={{ fontSize: 18, color: 'white' }}>Viewers: {this.props.count}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export default translate(connect()(ParticipantCount));
