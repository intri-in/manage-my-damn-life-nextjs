- Fixed problem of sqlite not working with MMDL.
    - Problem stemmed from:
        - Lack of environment directive to sequelize-cli command
        - lack of dotenv and sequelize-cli being included in nextJS stand alone build. They were missing from final node_modules. Changed dockerfile to include them.
        