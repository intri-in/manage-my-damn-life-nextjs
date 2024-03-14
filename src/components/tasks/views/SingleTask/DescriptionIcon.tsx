import { getI18nObject } from '@/helpers/frontend/general';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { MdSpeakerNotes } from 'react-icons/md';

const i18next = getI18nObject()
export const DescriptionIcon = ({text}:{text:string}) =>{
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
          {`${i18next.t("DESCRIPTION")}: `}{text}
        </Tooltip>
      );
    
      return (
        <OverlayTrigger
          placement="top"
          overlay={renderTooltip}
        >
         <span> <MdSpeakerNotes /></span>
        </OverlayTrigger>
      );
}