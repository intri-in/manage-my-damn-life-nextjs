# Install

1. Clone the repository  

    ```
    git clone https://github.com/intri-in/manage-my-damn-life-nextjs.git
    ```

1. To install dependencies, run:

    ``` npm install```

1. Copy the env file, and make desired changes to configuration. For more details see [Configuration](Configuration.md)

    ``` cp .env.local.sample .env.local```

1. Run the build command:

    ``` npm run build ```

1. Start the server:

    ``` npm run start```

    or to start development server, run:

    ``` npm run dev ```

    To run the server and get the control back on the command prompt you can also run:

    ``` nohup npm run start &```

1. Your server is now up and running. 
    
    For virtual host configuration see [Virtual Host Configuration](Configuration/VirtualHost.md)

1. Visit ```https://localhost:3000/install``` to run the installation process.
