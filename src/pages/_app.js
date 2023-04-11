import NextNProgress from 'nextjs-progressbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/global.css'

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
  </>)
}
