# Install

> ⚠️ **Instructions have changed since v0.3.0**

> This guide is useful for installation of v0.3.0 or above. Guide for older versions is available [here](https://manage-my-damn-life-nextjs.readthedocs.io/en/v0.2.0/).


1. Clone the repository  

    ```
    git clone https://github.com/intri-in/manage-my-damn-life-nextjs.git
    ```

1. To install dependencies, run:

    ``` npm install```

1. Install mysql and create a database.

1. Copy the env file, and make desired changes to configuration. For more details see [Configuration](../Configuration/WithoutDocker.md)

    ``` cp sample.env.local .env.local```

1. Run database migrations.

    ```npm run migrate```

1. Run the build command:

    ``` npm run build ```

1. Start the server:

    ``` npm run start```

    or to start development server, run:

    ``` npm run dev ```

    To run the server and get the control back on the command prompt you can also run:

    ``` nohup npm run start &```

    To see the started node process you can run

    ```ps aux | grep node```

1. Your server is now up and running. 
    
    For virtual host configuration see [Virtual Host Configuration](VirtualHost.md)

1. Visit ```https://localhost:3000/install``` to run the installation process.

1. If you're not using OAuth, register for a new account. Login to your new account.

1. If not automatically redirected to "Add CalDAV Account" page, visit ```http://localhost:3000/accounts/caldav``` to add your first CalDAV account. 