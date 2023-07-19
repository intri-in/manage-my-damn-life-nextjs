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
                </Popover.Body>
            </Popover>      
        </>
    );

}

export default SimpleOverlay;