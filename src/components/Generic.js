import { ToastContainer, toast } from 'react-toastify';
import Alert from 'react-bootstrap/Alert';
import { getI18nObject } from '@/helpers/frontend/general';
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
  

export function nothingToShow(){
  var i18next = getI18nObject()
  return(<>
          <Alert variant="secondary">
          {i18next.t("NOTHING_TO_SHOW")}
        </Alert>
  </>)
}