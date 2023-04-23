# Virtual Host Configuration

This guide is for setting up MMDL with Apache virtual host.

Let’s say you’ve copied your MMDL files to:

```
/var/www/html/example.com/
```

Build and start the server:

```
npm run build
nohup npm start &
```

This will start your server, but give you back control of the terminal window after you press a key. To see what process was started and to see its ID in case you want to terminate the Node server, run:

```
ps aux | grep node
```

Setup a virtual host in Apache. In Ubuntu, go to  /etc/apache/sites-available/, and setup a file named example.com.conf with the following info:

```

ServerAdmin admin@example.com
ServerName example.com
ServerAlias www.example.com
DocumentRoot /var/www/html/example.com/

ProxyRequests off

<Proxy *>
Order deny,allow
Allow from all
</Proxy>

<Location />
ProxyPass http://localhost:3000/
ProxyPassReverse http://localhost:3000/
</Location>


ErrorLog ${APACHE_LOG_DIR}/example.com.log
CustomLog ${APACHE_LOG_DIR}/access_example.com.log combined

```

Enable your site, and restart your Apache web server:

```
sudo a2ensite example.com.conf

sudo service apache2 restart
```

MMDL should now be available at example.com