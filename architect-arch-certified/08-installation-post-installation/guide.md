# Post Installation Tasks

> **Note:**
>
> #### Post‑installation Hardening & Tuning
> 
> Optional settings you can apply after installation to harden Tomcat/Pentaho and tune behaviour:

<details>

<summary>Hide Tomcat Server header</summary>

By default, Tomcat sends a `Server` header exposing version information. You can override it to reduce information leakage.

1. Edit the Tomcat connector in `server.xml`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/conf/server.xml
```

2. Add or update the `server` attribute on the HTTP connector and (if used) AJP connector, then save.

```xml
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           server=" "
           redirectPort="8443" />
```

3. Restart Pentaho Server.

```bash
sudo systemctl restart pentaho-server
```

</details>

<details>

<summary>Java Security Manager (deprecated/removed)</summary>

The legacy Java Security Manager is deprecated and not available on modern Java LTS versions (including Java 21). Do not use `-security` with Tomcat on Java 21. Prefer OS‑level hardening, least‑privilege users, network scoping, and container/AppArmor/SELinux policies as appropriate.

</details>

<details>

<summary>Change the web application context path</summary>

Change the context path if you do not want the application accessible at `/pentaho`.

1. Stop the Pentaho Server.

```bash
cd /opt/pentaho/server/pentaho-server
sudo ./stop-pentaho.sh
```

2. Edit `context.xml`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/META-INF/context.xml
```

3. Update the context path.

```xml
<Context path="/company" docBase="webapps/company/" />
```

4. Rename the webapp folder to match the new context name.

```bash
sudo mv /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho \
        /opt/pentaho/server/pentaho-server/tomcat/webapps/company
```

5. Update the redirect in `ROOT/index.jsp`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/ROOT/index.jsp
```

Change the meta refresh to:

```html
<meta http-equiv="refresh" content="0;URL=/company">
```

6. Update the server URL.

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
```

```
fully-qualified-server-url=http://localhost:8080/company/
```

7. Start the server and test.

```bash
sudo ./start-pentaho.sh
```

> **Warning:** Upgrades may overwrite deployed webapps. Reapply customizations after upgrades, or use reverse proxy path mapping instead.

</details>

<details>

<summary>Change to HTTPs</summary>

Default port is 8080.

1. Stop the Pentaho Server.

```bash
cd /opt/pentaho/server/pentaho-server
sudo ./stop-pentaho.sh
```

2. Change the connector port.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/conf/server.xml
```

```xml
<Connector URIEncoding="UTF-8"
      port="8443"
      protocol="org.apache.coyote.http11.Http11NioProtocol"
      maxThreads="150"
      SSLEnabled="true"
      scheme="https"
      secure="true"
      clientAuth="false"
      sslProtocol="TLS"
      keystoreType="PKCS12"
      keystoreFile="/opt/pentaho/pentaho-server/tomcat/ssl/keystore.p12"
      keystorePass="changeit"
    />
```

3. Update the server URL.

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
```

```
fully-qualified-server-url=http://localhost:8090/pentaho/
```

4. Start the server and verify.

```bash
sudo ./start-pentaho.sh
curl -I http://localhost:8090/pentaho/ | head -n 1
```

</details>

<details>

<summary>Change default HTTP port</summary>

Default port is 8080.

1. Stop the Pentaho Server.

```bash
cd /opt/pentaho/server/pentaho-server
sudo ./stop-pentaho.sh
```

2. Change the connector port.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/conf/server.xml
```

```xml
<Connector URIEncoding="UTF-8"
           port="8090" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443"
           relaxedPathChars="[]|"
           relaxedQueryChars="^{}[]|&amp;"
           maxHttpHeaderSize="65536" />
```

3. Update the server URL.

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
```

```
fully-qualified-server-url=http://localhost:8090/pentaho/
```

4. Start the server and verify.

```bash
sudo ./start-pentaho.sh
curl -I http://localhost:8090/pentaho/ | head -n 1
```

</details>

<details>

<summary>Harden or disable the Tomcat shutdown port</summary>

By default Tomcat listens on a local shutdown port (8005) for the `SHUTDOWN` command.

* Disable the port by setting `port="-1"`, or
* Change both the port and the shutdown command to unpredictable values.

1. Edit the `<Server>` element in `server.xml`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/conf/server.xml
```

Examples:

```xml
<Server port="-1" shutdown="SHUTDOWN">
```

or

```xml
<Server port="18005" shutdown="My$tr0ngShutCmd">
```

2. Restart Pentaho Server.

```bash
sudo systemctl restart pentaho-server
```

</details>

<details>

<summary>Custom error pages (404, 403, 500)</summary>

Define application‑level error pages to avoid exposing defaults.

1. Create an error page in your webapp.

```bash
sudo tee /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/error.jsp >/dev/null <<'EOF'
<html>
<head>
  <title>Error</title>
</head>
<body>
  <h1>Something went wrong</h1>
  <p>Please contact your administrator.</p>
</body>
</html>
EOF
```

2. Add error mappings in the webapp `web.xml`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/WEB-INF/web.xml
```

```xml
<error-page>
  <error-code>404</error-code>
  <location>/error.jsp</location>
</error-page>
<error-page>
  <error-code>403</error-code>
  <location>/error.jsp</location>
</error-page>
<error-page>
  <error-code>500</error-code>
  <location>/error.jsp</location>
</error-page>
```

3. Restart the server and test.

</details>

<details>

<summary>Session timeout</summary>

Set a global session timeout for the application.

1. Edit the webapp `web.xml`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/WEB-INF/web.xml
```

```xml
<session-config>
  <session-timeout>20</session-timeout>
</session-config>
```

</details>

<details>

<summary>Increase Karaf startup wait time</summary>

If server startup times out while Karaf installs features, increase the wait time.

1. Stop the server.

```bash
sudo systemctl stop pentaho-server
```

2. Edit `server.properties`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
```

Uncomment or add:

```
# Time (ms) to wait for Karaf to install features before timing out
karafWaitForBoot=180000
```

3. Start the server.

```bash
sudo systemctl start pentaho-server
```

</details>

<details>

<summary>Remove sample data from the server</summary>

Remove evaluation samples before moving to production.

1. Stop the server.

```bash
sudo systemctl stop pentaho-server
```

2. Delete the `samples.zip` from default content (path may vary by version).

```bash
sudo rm -f /opt/pentaho/server/pentaho-server/pentaho-solutions/system/default-content/samples.zip || true
```

3. Edit the webapp `web.xml` and remove the HSQLDB sample definitions and the SystemStatusFilter (dev‑only).

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/WEB-INF/web.xml
```

Remove blocks similar to:

```xml
<context-param>
  <param-name>hsqldb-databases</param-name>
  <param-value>sampledata@../../data/hsqldb/sampledata</param-value>
</context-param>

<listener>
  <listener-class>org.pentaho.platform.web.http.context.HsqldbStartupListener</listener-class>
</listener>

<filter>
  <filter-name>SystemStatusFilter</filter-name>
  <filter-class>com.pentaho.ui.servlet.SystemStatusFilter</filter-class>
</filter>
```

4. Optionally remove the server `data/` directory if only sample content was used (verify your environment before deleting).

```bash
sudo rm -rf /opt/pentaho/server/pentaho-server/data || true
```

5. Start the server and remove sample folders via PUC (Browse Files → Public → Move to Trash).

```bash
sudo systemctl start pentaho-server
```

</details>

<details>

<summary>Hide Home perspective widgets</summary>

Hide Getting Started and other widgets from the PUC Home page.

1. Stop the server.

```bash
sudo systemctl stop pentaho-server
```

2. Edit the Home perspective configuration.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/mantle/home/properties/config.properties
```

Add or update:

```
disabled-widgets=getting-started,recents,favorites
```

3. Start the server and log in to verify.

```bash
sudo systemctl start pentaho-server
```

</details>

<details>

<summary>Turn off autocomplete on the login page (advanced)</summary>

Changing vendor JSPs may be overwritten on upgrade. Prefer SSO or reverse proxy controls. If you must, edit the login JSP.

1. Stop the server.

```bash
sudo systemctl stop pentaho-server
```

2. Edit `PUCLogin.jsp`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/jsp/PUCLogin.jsp
```

3. Set autocomplete to off for user/password inputs.

```html
<input id="j_username" name="j_username" type="text" autocomplete="off">
<input id="j_password" name="j_password" type="password" autocomplete="off">
```

4. Start the server.

```bash
sudo systemctl start pentaho-server
```

</details>

<details>

<summary>Increase CSV upload limits</summary>

Adjust upload limits and (optionally) staging database.

1. Edit `pentaho.xml`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/pentaho.xml
```

```xml
<file-upload-defaults>
  <relative-path>/system/metadata/csvfiles/</relative-path>
  <max-file-limit>10000000</max-file-limit>
  <max-folder-limit>500000000</max-folder-limit>
</file-upload-defaults>
```

2. Change the staging database for CSV files (optional) in `data-access/settings.xml`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/data-access/settings.xml
```

```xml
<!-- settings for Agile Data Access -->
<data-access-staging-jndi>hibernate</data-access-staging-jndi>
```

3. In PUC, go to Tools → Refresh System Settings, then restart PUC (or the server) to apply.

</details>

***
