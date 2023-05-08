import { useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import { MdSpeakerNotes } from 'react-icons/md';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
function SimpleOverlay() {
    const [show, setShow] = useState(false);
    const target = useRef(null);
  
    return (
      <>
        <Popover id="popover-basic">
                <Popover.Header as="h3">Popover right</Popover.Header>
                <Popover.Body>
                And here's some <strong>amazing</strong> content. It's very engaging.
                right?
                </Popover.Body>
            </Popover>      
        </>
    );

}

export default SimpleOverlay;