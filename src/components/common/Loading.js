import Spinner from 'react-bootstrap/Spinner';

export function Loading(props)
{
    var size="sm"
    if(props.size!=null)
    {
        size=props.size
    }
    return(
        <div style={{padding: 5}}>
              <Spinner size={size} animation="grow" variant="primary" />
        </div>
    )
}