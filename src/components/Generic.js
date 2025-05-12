import { ToastContainer, toast } from 'react-toastify';
import Alert from 'react-bootstrap/Alert';
export function Toastify() {
    return (<ToastContainer
      position="top-right"
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