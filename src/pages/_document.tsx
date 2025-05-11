import nextI18nextConfig from 'next-i18next.config'
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentProps,
} from 'next/document'
type Props = DocumentProps & {
  // add custom document props
}
class MyDocument extends Document<Props>  {
  render() {
    const currentLocale =   this.props.__NEXT_DATA__.locale ??  nextI18nextConfig.i18n.defaultLocale
    return (
    <Html data-bs-theme="light" lang={currentLocale}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
  }
}

export default MyDocument