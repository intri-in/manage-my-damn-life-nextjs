import { ToastContainer, toast } from 'react-toastify';
import Alert from 'react-bootstrap/Alert';
import { SETTING_NAME_TOAST_LOCATION } from '@/helpers/frontend/settings';
export function Toastify() {

    let location = "bottom-center"
    if(typeof(window)!=="undefined"){
      location = (localStorage.getItem(SETTING_NAME_TOAST_LOCATION)) ? localStorage.getItem(SETTING_NAME_TOAST_LOCATION): "bottom-center"
    }
    return (<ToastContainer
      position={location.toLowerCase()}
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover={false}
      />)
  } 
  

// export function nothingToShow(){
//   return(<>
//           <Alert variant="secondary">
//           {i18next.t("NOTHING_TO_SHOW")}
//         </Alert>
//   </>)
// }