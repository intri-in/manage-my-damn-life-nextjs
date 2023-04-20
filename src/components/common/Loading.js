import { varNotEmpty } from '@/helpers/general';
import Spinner from 'react-bootstrap/Spinner';

export function Loading(props)
{
    var size="sm"
    if(props.size!=null)
    {
        size=props.size
    }

    var centered= null
    if(props.centered==true)
    {
        centered ="center"
    }
    
        return(
            <div style={{padding: 5, padding:props.padding, textAlign:centered}}>
                  <Spinner size={size} animation="grow" variant="primary" />
            </div>
        )
   

}