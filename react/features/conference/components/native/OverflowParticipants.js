// @flow

import React, { Component } from 'react';
import { Platform, Text, View } from 'react-native';
import { getParticipants } from '../../../base/participants';
import { ColorSchemeRegistry } from '../../../base/color-scheme';
import { BottomSheet, hideDialog, isDialogOpen } from '../../../base/dialog';
import { CHAT_ENABLED, IOS_RECORDING_ENABLED, getFeatureFlag } from '../../../base/flags';
import { connect } from '../../../base/redux';
import { StyleType } from '../../../base/styles';
import { SharedDocumentButton } from '../../../etherpad';
import { InfoDialogButton, InviteButton } from '../../../invite';
import { AudioRouteButton } from '../../../mobile/audio-mode';
import { LiveStreamButton, RecordButton } from '../../../recording';
import { RoomLockButton } from '../../../room-lock';
import { ClosedCaptionButton } from '../../../subtitles';
import { TileViewButton } from '../../../video-layout';
import RenderParticipant from './renderParticipant';

/**
 * The type of the React {@code Component} props of {@link OverflowMenu}.
 */
type Props = {
    /**
     * The color-schemed stylesheet of the dialog feature.
     */
    _bottomSheetStyles: StyleType,

    /**
     * Whether the chat feature has been enabled. The meeting info button will be displayed in its place when disabled.
     */
    _chatEnabled: boolean,

    /**
     * True if the overflow menu is currently visible, false otherwise.
     */
    _isOpen: boolean,

    /**
     * Whether the recoding button should be enabled or not.
     */
    _recordingEnabled: boolean,

    /**
     * Used for hiding the dialog when the selection was completed.
     */
    dispatch: Function,
    /**
     * Array of participant objects to display
     */
    participants: Array,
};

/**
 * The exported React {@code Component}. We need it to execute
 * {@link hideDialog}.
 *
 * XXX It does not break our coding style rule to not utilize globals for state,
 * because it is merely another name for {@code export}'s {@code default}.
 */
let OverflowMenu_; // eslint-disable-line prefer-const

/**
 * Implements a React {@code Component} with some extra actions in addition to
 * those in the toolbar.
 */
class OverflowMenu extends Component<Props> {
    /**
     * Initializes a new {@code OverflowMenu} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onCancel = this._onCancel.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */

    render() {
        console.log(this.props._bottomSheetStyles);
        const buttonProps = {
            afterClick: this._onCancel,
            showLabel: true,
            styles: this.props._bottomSheetStyles,
        };

        return (
            <BottomSheet onCancel={this._onCancel}>
                <View style={{ marginVertical: 8 }}></View>
                <Text style={{ fontSize: 18, marginBottom: 4 }}>Participants</Text>
                {this.props.participants.map((participant) => (
                    <RenderParticipant participant={participant} />
                ))}
                <View style={{ marginVertical: 8 }}></View>
            </BottomSheet>
        );
    }

    _onCancel: () => boolean;

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
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    let { desktopSharingEnabled } = state['features/base/conference'];
    if (state['features/base/config'].enableFeaturesBasedOnToken) {
        // we enable desktop sharing if any participant already have this
        // feature enabled
        desktopSharingEnabled =
            getParticipants(state).find(
                ({ features = {} }) => String(features['screen-sharing']) === 'true'
            ) !== undefined;
    }

    return {
        participants: getParticipants(state),
        _bottomSheetStyles: ColorSchemeRegistry.get(state, 'BottomSheet'),
        _chatEnabled: getFeatureFlag(state, CHAT_ENABLED, true),
        _isOpen: isDialogOpen(state, OverflowMenu_),
        _recordingEnabled: Platform.OS !== 'ios' || getFeatureFlag(state, IOS_RECORDING_ENABLED),
        _desktopSharingEnabled: Boolean(desktopSharingEnabled),
    };
}

OverflowMenu_ = connect(_mapStateToProps)(OverflowMenu);

export default OverflowMenu_;
