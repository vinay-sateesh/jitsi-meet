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
const selectToolbox = (roomName, localParticipant) => {
    switch (localParticipant.role) {
        case 'moderator':
        // return <ToolboxHost />
        default:
            return <ToolboxHost roomName={roomName} localParticipant={localParticipant} />
    }
};

export default selectToolbox;
