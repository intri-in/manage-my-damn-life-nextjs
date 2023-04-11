import { ToastContainer, toast } from 'react-toastify';

export function Toastify() {
    return (<ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover={false}
      />)
  } 
  