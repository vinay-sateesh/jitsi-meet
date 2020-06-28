// @flow

import { type Dispatch } from 'redux';
import { Text, Share } from 'react-native'
import React from 'react'
import { showNotification } from '../../../notifications'
import {
    createToolbarEvent,
    sendAnalytics
} from '../../../analytics';
import { translate } from '../../../base/i18n';
import { IconRaisedHand, IconReply } from '../../../base/icons';
import {
    getLocalParticipant,
    participantUpdated
} from '../../../base/participants';
import { connect } from '../../../base/redux';
import { AbstractButton } from '../../../base/toolbox';
import type { AbstractButtonProps } from '../../../base/toolbox';

/**
 * The type of the React {@code Component} props of {@link RaiseHandButton}.
 */
type Props = AbstractButtonProps & {

    /**
     * The local participant.
     */
    _localParticipant: Object,

    /**
     * Name of room participant is in
     */
    roomName: String,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Dispatch<any>,

};

/**
 * An implementation of a button to raise or lower hand.
 */
class ShareButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.raiseHand';
    icon = IconReply;
    label = 'toolbar.raiseYourHand';
    toggledLabel = 'toolbar.lowerYourHand';

    /**
     * Handles clicking / pressing the button.
     *
     * @override
     * @protected
     * @returns {void}
     */
    _handleClick() {
        this._toggleRaisedHand();
    }

    /**
     * Indicates whether this button is in toggled state or not.
     *
     * @override
     * @protected
     * @returns {boolean}
     */
    _isToggled() {
        return this.props._raisedHand;
    }

    /**
     * Toggles the rased hand status of the local participant.
     *
     * @returns {void}
     */
    async _toggleRaisedHand() {


        try {
            const result = await Share.share({
                message:
                    `Join the livestream at:\nhttps://apne.app/${this.props.roomName}`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }


    }
}

/**
 * Maps part of the Redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _raisedHand: boolean
 * }}
 */
function _mapStateToProps(state): Object {
    const _localParticipant = getLocalParticipant(state);

    return {
        _localParticipant,
        _raisedHand: _localParticipant.raisedHand
    };
}

export default translate(connect(_mapStateToProps)(ShareButton));
