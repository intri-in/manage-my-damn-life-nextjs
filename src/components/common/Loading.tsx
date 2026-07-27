import { varNotEmpty } from '@/helpers/general';
import Spinner from 'react-bootstrap/Spinner';

export function Loading({size, centered, padding}:{size?: any , centered?: boolean, padding?: number})
{
    let sizeToRender=size ??"sm" 
    
    let centeredVal= ""
    if(centered)
    {
        centeredVal ="center"
    }
    
        return(
            <div key="loading" style={{padding: padding??5, textAlign:centeredVal as CanvasTextAlign}}>
                  <Spinner size={size} animation="grow" variant="primary" />
            </div>
        )
   

}