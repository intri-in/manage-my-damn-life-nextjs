# Updating

## Updating to v0.3.0 from earlier versions

> ⚠️ **Instructions have changed since v0.3.0**

> This guide is useful for installation of v0.3.0 or above. Guide for older versions is available [here](https://manage-my-damn-life-nextjs.readthedocs.io/en/v0.2.0/).

Procedure to update MMDL will depend on how you've installed it.

### If MMDL has been Installed using Github


```
# Pull latest changes
git pull

# Examine the difference in .env file that you have, and if there have been any changes made upstream. Include relevant variables in your file, if required.
diff .env.local sample.env.local

# Install dependencies
npm i 

# Run database migrations
npm run migrate

# Build 
npm run build

# Run
npm run start
```

### If MMDL is Being Run With Docker

Since the variables in .env might have been changed, make the relevant changes to your file. More details can be found [here](install/Docker/index.md).

```docker-compose.yml``` has also changed in v0.3.0. You can find more details [here](install/Docker/index.md).

