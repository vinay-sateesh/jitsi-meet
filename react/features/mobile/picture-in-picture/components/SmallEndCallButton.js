// @flow

import _ from 'lodash';
import { createToolbarEvent, sendAnalytics } from '../../../analytics';
import { appNavigate } from '../../../app';
import { PIP_ENABLED, getFeatureFlag } from '../../../base/flags';
import { translate } from '../../../base/i18n';
import { IconMenuDown, IconClose } from '../../../base/icons';
import { connect } from '../../../base/redux';
import { AbstractButton } from '../../../base/toolbox';
import { AbstractHangupButton } from '../../../base/toolbox';
import type { AbstractButtonProps } from '../../../base/toolbox';

type Props = AbstractButtonProps & {
    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,
};

/**
 * An implementation of end call button to put in the top navbar
 */
class SmallEndCallButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.hangup';
    icon = IconClose;
    label = 'End';
    tooltip = 'toolbar.hangup';

    constructor(props: Props) {
        super(props);

        this._hangup = _.once(() => {
            sendAnalytics(createToolbarEvent('hangup'));

            // FIXME: these should be unified.
            if (navigator.product === 'ReactNative') {
                this.props.dispatch(appNavigate(undefined));
            } else {
                this.props.dispatch(disconnect(true));
            }
        });
    }

    /**
     * Helper function to perform the actual hangup action.
     *
     * @override
     * @protected
     * @returns {void}
     */
    _doHangup() {
        this._hangup();
    }

    _handleClick() {
        this._doHangup();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {React$Node}
     */
}

/**
 *FIX THIS - not required for now
 */
function _mapStateToProps(state): Object {
    return {
        _enabled: Boolean(getFeatureFlag(state, PIP_ENABLED)),
    };
}

export default translate(connect(_mapStateToProps)(SmallEndCallButton));
