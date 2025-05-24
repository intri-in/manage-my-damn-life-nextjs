// import Keycloak from 'keycloak-js';
// import { varNotEmpty } from '../general';
// import { getI18nObject } from '../frontend/general';
// const i18next = getI18nObject()

// /**
//  * Checks if the user is logged in.
//  * If no value of NEXT_PUBLIC_OPEN_ID_PROVIDER is provided as an environment variable
//  * we will assume that the user wants to use MMDL's inbuilt login functions.
//  * @returns Promise of a blooean. True if user is logged in.
//  */
// export async function isUserLoggedIn(): Promise<boolean>{

//     if(!varNotEmpty(process.env.NEXT_PUBLIC_OPEN_ID_PROVIDER)){
//         return true
//     }

    
//     try{
//         switch (process.env.NEXT_PUBLIC_OPEN_ID_PROVIDER!.trim().toUpperCase()){

//             case "KEYCLOAK": 
//                 return silentCheckSSO_KeyCloak();
//             case "":
//                 return true
//             default: 
//                 throw new Error(i18next.t("ERROR_INVALID_VALUE_OPENID_PROVIDER")!)
    
//         }
    
//     }catch(e){
//         console.error(e)
//         throw new Error(i18next.t("ERROR_INVALID_VALUE_OPENID_PROVIDER")!)
//     }

    
// }

// /**
//  * Checks if user is logged in with Keycloak.
//  * Uses check-sso in Keycloak initiation.
//  */
// export async function silentCheckSSO_KeyCloak(){
//     const keycloak = new Keycloak({
//         url: process.env.NEXT_PUBLIC_OPEN_ID_PROVIDER_URL,
//         realm: process.env.NEXT_PUBLIC_OPEN_ID_PROVIDER_REALM!,
//         clientId: process.env.NEXT_PUBLIC_OPEN_ID_PROVIDER_CLIENT_ID!
//     });

   
//     try {
//         keycloak.init({onLoad: "login-required"}).then((authenticated) =>{

//         if(authenticated){
//             return true
//         }else{
//             return false
//         }

//         })

//     } catch (error) {
//         console.log('Failed to initialize adapter:', error)
//     }

//     return false

  

// }