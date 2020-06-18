// @flow

import React, { Component } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ParticipantCount from './ParticipantCount';
import { getConferenceName } from '../../../base/conference';
import { connect } from '../../../base/redux';
import { PictureInPictureButton, SmallEndCallButton } from '../../../mobile/picture-in-picture';

import { isToolboxVisible, isTopNavigationVisible } from '../../../toolbox';

import styles, { NAVBAR_GRADIENT_COLORS } from './styles';

type Props = {
    /**
     * Name of the meeting we're currently in.
     */
    _meetingName: string,
    _bottomSheetStyles: StyleType,

    _hostName: string,
    NumberOfParticipants: number,
};

/**
 * Implements a navigation bar component that is rendered on top of the
 * conference screen.
 */
class Topbar extends Component<Props> {
    /**
     * Hides this {@code OverflowMenu}.
     *
     * @private
     * @returns {boolean}
     */
    _onCancel() {
        if (this.props._isOpen) {
            this.props.dispatch(hideDialog(OverflowMenu_));

            return true;
        }

        return false;
    }
    /**
     * Implements {@Component#render}.
     *
     * @inheritdoc
     */
    render() {
        const buttonProps = {
            showLabel: true,
        };

        return [
            <View key={1} pointerEvents="box-none" style={styles.navBarWrapper}>
                {/* <PictureInPictureButton styles={{ ...styles.navBarButton, flex: 1 }} /> */}

                {/* <View pointerEvents="box-none" style={styles.roomNameWrapper}>
                    <Text
                        numberOfLines={2}
                        style={{
                            ...styles.roomName,
                            textAlign: 'center',
                            marginTop: 8,
                        }}
                    >
                        {this.props._meetingName}
                    </Text>
                </View> */}
                <View style={{ justifyContent: 'flex-end', flex: 1, flexDirection: 'row' }}>
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            marginHorizontal: 8,
                        }}
                    >
                        <ParticipantCount count={this.props.NumberOfParticipants} />
                    </View>
                    <SmallEndCallButton
                        styles={{ ...styles.customNavBarButton, flex: 1 }}
                        {...buttonProps}
                    />
                </View>
            </View>,
        ];
    }
}

/**
 * Maps part of the Redux store to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {{
 *     _meetingName: string,
 *     _visible: boolean
 * }}
 */
function _mapStateToProps(state) {
    return {
        _hostName: state['features/base/participants'][0].name,
        _meetingName: getConferenceName(state),
        _visible: isTopNavigationVisible(state),
    };
}

export default connect(_mapStateToProps)(Topbar);
