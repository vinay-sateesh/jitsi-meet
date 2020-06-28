// @flow

import React from 'react';
import {
    KeyboardAvoidingView,
    SafeAreaView,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from 'react-native';
import { shouldDisplayTileView } from '../../../video-layout';
import { Filmstrip } from '../../../filmstrip';
import { ColorSchemeRegistry } from '../../../base/color-scheme';
import { translate } from '../../../base/i18n';
import { HeaderWithNavigation, SlidingView } from '../../../base/react';
import { connect } from '../../../base/redux';
import { StyleType } from '../../../base/styles';
import LinearGradient from 'react-native-linear-gradient';

import AbstractChat, {
    _mapDispatchToProps,
    _mapStateToProps as _abstractMapStateToProps,
    type Props as AbstractProps,
} from '../AbstractChat';

import ChatInputBar from './ChatInputBar';
import MessageContainer from './MessageContainer';
import MessageRecipient from './MessageRecipient';
import styles from './styles';
import { Toolbox, selectToolbox } from '../../../toolbox';

type Props = AbstractProps & {
    /**
     * The color-schemed stylesheet of the feature.
     */
    _styles: StyleType,
    /**
     * Renders different toolbar based on user role
     * @type {Boolean}
     */
    isModerator: boolean,
    roomName: String,
    localParticipant: Object,

    _shouldDisplayTileView: boolean
};

/**
 * Implements a React native component that renders the chat window (modal) of
 * the mobile client.
 */
class Chat extends AbstractChat<Props> {
    state = {
        keyboardUp: false,
    };
    componentDidMount() {
        this._keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
            this.keyboardDidShow.bind(this)
        );
        this._keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
            this.keyboardDidHide.bind(this)
        );
    }
    componentWillUnmount() {
        this._keyboardDidShowListener.remove();
        this._keyboardDidHideListener.remove();
    }
    keyboardDidShow() {
        this.setState({
            keyboardUp: true,
        });
    }

    keyboardDidHide() {
        this.setState({
            keyboardUp: false,
        });
    }
    /**
     * Instantiates a new instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._onClose = this._onClose.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { _styles } = this.props;
        // this.props._AlwaysOpenChat();
        const flexProp = this.state.keyboardUp ? { flex: 0 } : { flex: 1.3 };
        return (
            <SlidingView onHide={this._onClose} position="bottom" show={true} transparent dontHide>
                <View
                    // behavior="padding"

                    style={styles.chatContainer}
                >
                    {/* <HeaderWithNavigation
                        headerLabelKey="chat.title"
                        onPressBack={this._onClose}
                    /> */}

                    <SafeAreaView
                        onStartShouldSetResponder={() => true}
                        style={{
                            ..._styles.backdrop,
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            // ...flexProp,
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                height: '40%',
                            }}
                        >
                            <MessageContainer messages={this.props._messages} />

                            <MessageRecipient />
                        </View>
                        {/* <ChatInputBar onSend={this.props._onSendMessage} /> */}
                        <View style={{ justifyContent: 'flex-end' }}>
                            {
                                /*
                                 * The Filmstrip is in a stacking layer above the
                                 * LargeVideo. The LargeVideo and the Filmstrip form what
                                 * the Web/React app calls "videospace". Presumably, the
                                 * name and grouping stem from the fact that these two
                                 * React Components depict the videos of the conference's
                                 * participants.
                                 */
                                this.props._shouldDisplayTileView ? undefined : <Filmstrip />
                            }
                        </View>
                    </SafeAreaView>
                </View>
                {/* {selectToolbox(this.props.isModerator)} */}
                {selectToolbox(this.props.roomName, this.props.localParticipant)}
            </SlidingView>
        );
    }

    _onClose: () => boolean;

    /**
     * Closes the chat window.
     *
     * @returns {boolean}
     */
    _onClose() {
        // if (this.props._isOpen) {
        //     this.props._onToggleChat();

        //     return true;
        // }

        // return false;
        return true;
    }
}

/**
 * Maps part of the redux state to the props of this component.
 *
 * @param {Object} state - The Redux state.
 * @returns {Props}
 */
function _mapStateToProps(state) {
    return {
        ..._abstractMapStateToProps(state),
        _styles: ColorSchemeRegistry.get(state, 'Chat'),
        _shouldDisplayTileView: shouldDisplayTileView(state),
    };
}

export default translate(connect(_mapStateToProps, _mapDispatchToProps)(Chat));
