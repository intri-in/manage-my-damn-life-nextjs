import { useTranslation } from 'next-i18next';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { MdSpeakerNotes } from 'react-icons/md';

export const DescriptionIcon = ({text}:{text:string}) =>{
    const {t} = useTranslation()
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
          {`${t("DESCRIPTION")}: `}{text}
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