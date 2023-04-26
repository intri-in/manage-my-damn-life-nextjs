import NextNProgress from 'nextjs-progressbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styles/global.css'
import { Toastify } from '@/components/Generic';
import 'react-toastify/dist/ReactToastify.css';

function load()
{
  NProgress.start();
}

function stop()
{
  NProgress.done();
}

export default function App({ Component, pageProps }) {
  return (<>
      <NextNProgress  color="#ff0000"  height={5} options={{ showSpinner: false }}/>
      <Component {...pageProps} />
      <Toastify />
  </>)
}
