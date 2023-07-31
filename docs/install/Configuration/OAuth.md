# Setting up OAuth With MMDL

Version 0.3.0 introduced OAuth support for MMDL.

MMDL now uses [NextAuth.js](https://next-auth.js.org/) to enable OAuth and authentication.
It's highly recommended that you use a third party authentication service. Please note that third party authentication will eventually become the default option in the future versions of MMDL (probably by v1.0.0).

NextAuth.js is an amazing library and it supports many open source, as well as proprietary authentication services.

This guide will help you setup OAuth with MMDL.

First, you will need to setup a ```.env.local``` file. Detailed guide is available [here](WithoutDocker.md).

To setup OAuth certain variables need to be set in your ```.env.local``` file.

### NEXT_PUBLIC_USE_NEXT_AUTH

> Required to Change From Default: **Yes**

```
Example:
NEXT_PUBLIC_USE_NEXT_AUTH=true
```
### NEXTAUTH_URL
> Required to Change From Default: **Maybe**

This is a required variable for setting up NextAuth.js. It **must be the same** as [NEXT_PUBLIC_BASE_URL variable](WithoutDocker.md), which is the base URL of your MMDL installation.

```
Example:
NEXTAUTH_URL="http://localhost:3000/"
```

### NEXTAUTH_SECRET
> Required to Change From Default: **Yes**

This is a secret key that is used by NextAuth.js and needs to be set. More details are available [here](https://next-auth.js.org/configuration/options#nextauth_secret).

```
NEXTAUTH_SECRET="REALLY_SUPER_STRONG_SECRET_KEY"
```

## Provider Setup

Numerous Auth Providers are supported by NextAuth.js. You can find the complete list [here](https://next-auth.js.org/providers/).

MMDL aims to support all these providers. Each provider needs two to three variables (in most cases):

- Client ID
- Client Secret
- Issuer URL

Out of the box, MMDL supports three main providers: Keycloak, Google, and Authentik.

### Keycloak
As an example, to setup Keycloak, you need to add three variable in the ```.env.local``` file.

```
KEYCLOAK_ISSUER_URL="http://localhost:8080/realms/MMDL"
KEYCLOAK_CLIENT_ID="mmdl-front-end"
KEYCLOAK_CLIENT_SECRET="a7LjWUFdCFhYaW2KKba2AeOkZu0n58Pb"
```

The value for these variables can be obtained from your Keycloak installation.

### Authentik

```
AUTHENTIK_CLIENT_ID="SAMPLE_CLIENT_ID"
AUTHENTIK_CLIENT_SECRET="SAMPLE_CLIENT_SECRET"
AUTHENTIK_ISSUER="http://example.authentik.com/"
```

Please refer to Authentik docs to get the values of these variables.


### Google
To enable Google as an auth provider, you need to set just two variables:

```
GOOGLE_CLIENT_ID="SAMPLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="SUPER_SECRET_KEY"

```

### Others

All the other providers that are supported by NextAuth.js will be eventually included to work by simply setting variables in ```.env.local```in the future. 

Right now, if you want to make them work, it requires a bit of work.

To make them work, you will need to edit the file ```config/nextAuthProviders.js```.

#### Example

To make github work with MMDl, open the ```config/nextAuthProviders.js``` file, and start editing.

To get a hint, refer to the docs of [NextAuth.js](https://next-auth.js.org/providers/github).

```
import GitHubProvider from "next-auth/providers/github";
...

  authProviders.push(
    GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET
    })
  )

```
Post the edit, you'll need to build MMDL again.

```
npm run build
npm run start
```

Future releases of MMDL will try to include as many providers as possible.