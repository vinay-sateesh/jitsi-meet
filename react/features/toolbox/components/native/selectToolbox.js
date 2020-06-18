import Toolbox from './Toolbox';
import ToolboxHost from './ToolboxHost';
import ToolboxOnCall from './ToolboxOnCall';
import React from 'react';

/**
 * Meeting host and participants have different toolboxes and
 * this function provides the correct one
 * @param {boolean} isModerator - Checks if participant is meeting host or not
 * @param {boolean} onCall - The toolbox changes for a participant allowed to video/audio call
 */
const selectToolbox = (isModerator, onCall = false) => {
    console.log('selectToolbox', isModerator);
    if (isModerator) {
        return <ToolboxHost />;
    } else {
        if (onCall) {
            return <ToolboxOnCall />;
        } else return <Toolbox />;
    }
};

export default selectToolbox;
