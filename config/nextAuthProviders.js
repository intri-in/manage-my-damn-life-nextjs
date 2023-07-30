import KeycloakProvider from "next-auth/providers/keycloak";
import GoogleProvider from 'next-auth/providers/google'
import AuthentikProvider from 'next-auth/providers/authentik'
import { varNotEmpty } from "@/helpers/general";

/**
 * Array of authProviders that will be passed to NextAuth.js
 */
const authProviders = []

/**
 * Add KeyCloak if parameters are defined.
 */
if(varNotEmpty(process.env.KEYCLOAK_CLIENT_ID) && varNotEmpty(process.env.KEYCLOAK_ISSUER_URL) && varNotEmpty(process.env.KEYCLOAK_CLIENT_SECRET)){
    authProviders.push(    
      KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      issuer: process.env.KEYCLOAK_ISSUER_URL,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET
    }),
    )
}

/**
 * Add Google Provider if parameters are defined.
*/
if(varNotEmpty(process.env.GOOGLE_CLIENT_ID) && varNotEmpty(process.env.GOOGLE_CLIENT_SECRET) ){
    authProviders.push(    
      GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
    )
}
/**
 * Add Authentik Provider if parameters are defined.
*/
if(varNotEmpty(process.env.AUTHENTIK_CLIENT_ID) && varNotEmpty(process.env.AUTHENTIK_CLIENT_SECRET) && varNotEmpty(process.env.AUTHENTIK_ISSUER)){

  authProviders.push(
    AuthentikProvider({
      clientId: process.env.AUTHENTIK_CLIENT_ID,
      clientSecret: process.env.AUTHENTIK_CLIENT_SECRET,
      issuer: process.env.AUTHENTIK_ISSUER,
    })
    )
}
export default authProviders