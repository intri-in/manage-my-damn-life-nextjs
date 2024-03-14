import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export const SummaryText = ({text}: {text: string | undefined}) =>{
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
          {text}
        </Tooltip>
      );
    
      return (
        <OverlayTrigger
          placement="top"
          overlay={renderTooltip}
        >
         <span>{text}</span>
        </OverlayTrigger>
      );
}