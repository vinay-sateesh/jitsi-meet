// @flow

import React, { PureComponent } from "react";
import {
    View,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Animated,
    Keyboard,
} from "react-native";
import type AnimatedValue from "react-native/Libraries/Animated/src/nodes/AnimatedValue";
import { ColorSchemeRegistry } from "../../../base/color-scheme";
import { CHAT_ENABLED, getFeatureFlag } from "../../../base/flags";
import { Container } from "../../../base/react";
import { connect } from "../../../base/redux";
import { StyleType, BoxModel } from "../../../base/styles";
import { ChatButton } from "../../../chat";
import { InfoDialogButton } from "../../../invite";

import { isToolboxVisible } from "../../functions";
import type { Dispatch } from "redux";
import AudioMuteButton from "../AudioMuteButton";
import HangupButton from "../HangupButton";
import { sendMessage } from "../../../chat/actions";
import OverflowMenuButton from "./OverflowMenuButton";
import styles from "./styles";
import VideoMuteButton from "../VideoMuteButton";
import ChatInputBar from "../../../chat/components/native/ChatInputBar";

/**
 * The type of {@link Toolbox}'s React {@code Component} props.
 */
type Props = {
    /**
     * Whether the chat feature has been enabled. The meeting info button will be displayed in its place when disabled.
     */
    _chatEnabled: boolean,
    /**
     * Function to send a text message.
     *
     * @protected
     */
    _onSendMessage: Function,
    /**
     * The color-schemed stylesheet of the feature.
     */
    _styles: StyleType,

    /**
     * The indicator which determines whether the toolbox is visible.
     */
    _visible: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Dispatch<any>,

    keyboardWillShowSub: Function,
    keyboardWillHideSub: Function,
};
type State = {
    kHeight: number,
};
/**
 * Implements the conference toolbox on React Native.
 */
class Toolbox extends PureComponent<Props, State> {
    setKeyboardHeight: Function;
    keyboardHeight: AnimatedValue;
    state = {
        kHeight: BoxModel.padding,
    };
    // componentDidMount = () => {
    //     this.setState({ keyboardHeight: new Animated.Value(BoxModel.padding) });
    // };
    keyboardWillShowSub: Function;
    keyboardWillHideSub: Function;
    constructor(props: Props) {
        super(props);
        this.keyboardHeight = new Animated.Value(BoxModel.padding);
    }
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */

    componentWillMount() {
        this.keyboardWillShowSub = Keyboard.addListener(
            "keyboardDidShow",
            this.keyboardWillShow.bind(this)
        );
        this.keyboardWillHideSub = Keyboard.addListener(
            "keyboardDidHide",
            this.keyboardWillHide.bind(this)
        );
    }

    componentWillUnmount() {
        this.keyboardWillShowSub.remove();
        this.keyboardWillHideSub.remove();
    }
    keyboardWillShow = (event) => {
        Animated.parallel([
            Animated.timing(this.keyboardHeight, {
                duration: event.duration,
                toValue: event.endCoordinates.height + BoxModel.padding,
            }),
        ]).start();
    };

    keyboardWillHide = (event) => {
        Animated.parallel([
            Animated.timing(this.keyboardHeight, {
                duration: event.duration,
                toValue: BoxModel.padding,
            }),
        ]).start();
    };
    // setKeyboardHeight = (toggle) => {
    //     if (toggle) {
    //         Animated.parallel([
    //             Animated.timing(this.state.keyboardHeight, {
    //                 duration: 2,
    //                 toValue: 300,
    //             }),
    //         ]).start();
    //     } else
    //         Animated.parallel([
    //             Animated.timing(this.state.keyboardHeight, {
    //                 duration: 2,
    //                 toValue: BoxModel.padding,
    //             }),
    //         ]).start();
    //     console.log(toggle, this.state.keyboardHeight);
    // };

    render() {
        return (
            <Container style={styles.toolbox} visible={this.props._visible}>
                {this._renderToolbar()}
            </Container>
        );
    }

    /**
     * Constructs the toggled style of the chat button. This cannot be done by
     * simple style inheritance due to the size calculation done in this
     * component.
     *
     * @param {Object} baseStyle - The base style that was originally
     * calculated.
     * @returns {Object | Array}
     */
    _getChatButtonToggledStyle(baseStyle) {
        const { _styles } = this.props;

        if (Array.isArray(baseStyle.style)) {
            return {
                ...baseStyle,
                style: [...baseStyle.style, _styles.chatButtonOverride.toggled],
            };
        }

        return {
            ...baseStyle,
            style: [baseStyle.style, _styles.chatButtonOverride.toggled],
        };
    }

    /**
     * Renders the toolbar. In order to avoid a weird visual effect in which the
     * toolbar is (visually) rendered and then visibly changes its size, it is
     * rendered only after we've figured out the width available to the toolbar.
     *
     * @returns {React$Node}
     */
    _renderToolbar() {
        const { _chatEnabled, _styles } = this.props;
        const {
            buttonStyles,
            buttonStylesBorderless,
            hangupButtonStyles,
            toggledButtonStyles,
        } = _styles;

        return (
            <Animated.View
                pointerEvents="box-none"
                style={{
                    ...styles.toolbar,
                    paddingBottom: this.keyboardHeight,
                }}
            >
                {/* {_chatEnabled && (
                    <ChatButton
                        styles={buttonStylesBorderless}
                        toggledStyles={this._getChatButtonToggledStyle(
                            toggledButtonStyles
                        )}
                    />
                )} */}

                <ChatInputBar
                    // onFocus={() => this.setKeyboardHeight(true)}
                    // onBlur={() => this.setKeyboardHeight(false)}
                    onSend={this.props._onSendMessage}
                />

                {!_chatEnabled && (
                    <InfoDialogButton
                        styles={buttonStyles}
                        toggledStyles={toggledButtonStyles}
                    />
                )}
                <AudioMuteButton
                    styles={buttonStyles}
                    toggledStyles={toggledButtonStyles}
                />
                {/* <HangupButton
                    styles = { hangupButtonStyles } /> */}
                <VideoMuteButton
                    styles={buttonStyles}
                    toggledStyles={toggledButtonStyles}
                />
                <OverflowMenuButton
                    styles={buttonStylesBorderless}
                    toggledStyles={toggledButtonStyles}
                />
            </Animated.View>
        );
    }
}

/**
 * Maps parts of the redux state to {@link Toolbox} (React {@code Component})
 * props.
 *
 * @param {Object} state - The redux state of which parts are to be mapped to
 * {@code Toolbox} props.
 * @private
 * @returns {{
 *     _chatEnabled: boolean,
 *     _styles: StyleType,
 *     _visible: boolean
 * }}
 */
function _mapStateToProps(state: Object): Object {
    return {
        _chatEnabled: getFeatureFlag(state, CHAT_ENABLED, true),
        _styles: ColorSchemeRegistry.get(state, "Toolbox"),
        _visible: isToolboxVisible(state),
    };
}

function _mapDispatchToProps(dispatch: Dispatch<any>) {
    return {
        /**
         * Sends a text message.
         *
         * @private
         * @param {string} text - The text message to be sent.
         * @returns {void}
         * @type {Function}
         */
        _onSendMessage(text: string) {
            dispatch(sendMessage(text));
        },
    };
}

export default connect(_mapStateToProps, _mapDispatchToProps)(Toolbox);
