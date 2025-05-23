import { NextRequest, NextResponse } from 'next/server'
import acceptLanguage from 'accept-language'
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from './config/constants'
import { LOCALSTORAGE_KEYNAME_CURRENT_LANGUAGE, appendLanguageToURL, langAlreadyinURL, shouldRedirectWithLang } from './helpers/frontend/translations'
import { appendLangParamtoURL } from './helpers/general'

acceptLanguage.languages(AVAILABLE_LANGUAGES)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!logo.png|api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    "/",
  ],
}
export function middleware(req) {
  let lng=""

  if (req.cookies.has(LOCALSTORAGE_KEYNAME_CURRENT_LANGUAGE) && req.cookies.get(LOCALSTORAGE_KEYNAME_CURRENT_LANGUAGE)) lng = acceptLanguage.get(req.cookies.get(LOCALSTORAGE_KEYNAME_CURRENT_LANGUAGE).value)
  
  // if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng) lng = DEFAULT_LANGUAGE
  
  // Redirect if lng in path is not supported
  // console.log("==============")
  // console.log("shouldRedirectWithLang", shouldRedirectWithLang(req.nextUrl.toString(),lng),req.nextUrl.toString(),lng)
  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value

  // console.log("req.nextUrl.locale", req.nextUrl.locale, cookieLocale)
  if (cookieLocale && cookieLocale!=req.nextUrl.locale) {
    return NextResponse.redirect(
      new URL(
        `/${cookieLocale}${req.nextUrl.pathname}${req.nextUrl.search}`,
        req.url,
      ),
    )
  }


  // if (req.headers.has('referer')) {
  //   const refererUrl = new URL(req.headers.get('referer')!)
  //   console.log("lang", refererUrl)
  //   const lngInReferer = langArray.find((l) => {
  //     const lang = refererUrl.searchParams.get("lng")
  //     if(l===lang){
  //       return true
  //     }
  //   })
  //   const response = NextResponse.next()
  //   if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
  //   return response
  // }

  return NextResponse.next()
}