# Post Installation Tasks

> **Note:**
>
> #### Post‑installation Hardening & Tuning
> 
> Optional settings you can apply after installation to harden Tomcat/Pentaho and tune behaviour:

> **Warning:** Stop and start the server as the `pentaho` user (`sudo -u pentaho ./stop-pentaho.sh`), or with `systemctl` if you created the service in **Install Pentaho Server**. Started as root, it leaves root-owned files under `tomcat/logs`, `work` and `temp` that the `pentaho` user can no longer write.

> **Warning:** Stop and start the server as the `pentaho` user (`sudo -u pentaho ./stop-pentaho.sh`), or with `systemctl` if you created the service in **Install Pentaho Server**. Started as root, it leaves root-owned files under `tomcat/logs`, `work` and `temp` that the `pentaho` user can no longer write.

<details>

<summary>Hide Tomcat Server header</summary>

Tomcat 10.1 sends no `Server` header unless an application sets one, and Pentaho's `server.xml` already hides the version on error pages (`showServerInfo="false"` on the `ErrorReportValve`). Check what your server sends first:

```bash
curl -sI http://localhost:8080/pentaho/Login | grep -i '^server:' || echo "no Server header"
```

Set the connector's `server` attribute only if a scan still shows a `Server` header, for example one added by a proxy or an application.

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

The legacy Java Security Manager is deprecated for removal: it still works on Java 21 but prints warnings, and from JDK 24 it is permanently disabled. Do not build new hardening on Tomcat's `-security` option. Prefer OS‑level hardening, least‑privilege users, network scoping, and container/AppArmor/SELinux policies as appropriate.

</details>

<details>

<summary>Change the web application context path</summary>

Change the context path if you do not want the application accessible at `/pentaho`.

1. Stop the Pentaho Server.

```bash
cd /opt/pentaho/server/pentaho-server
sudo -u pentaho ./stop-pentaho.sh
```

2. Edit `context.xml`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/META-INF/context.xml
```

3. In the opening `<Context ...>` tag, change `/pentaho` to `/company` in both attributes. Keep the `<Resource>` elements inside it: they are the server's database connections, and replacing the element with a self-closing one deletes them.

```xml
<Context path="/company" docbase="webapps/company/">
```

> **Note:** Tomcat ignores these two attributes in `META-INF/context.xml` (its log says `failed to set property [docbase]`): the folder name in step 4 is what sets the path. Changing them keeps the file consistent.

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
alternative-fully-qualified-server-urls=http://127.0.0.1:8080/company/
```

7. Start the server and test.

```bash
sudo -u pentaho ./start-pentaho.sh
```

> **Warning:** Upgrades may overwrite deployed webapps. Reapply customizations after upgrades, or use reverse proxy path mapping instead.

</details>

<details>

<summary>Change to HTTPs</summary>

Default port is 8080.

1. Stop the Pentaho Server.

```bash
cd /opt/pentaho/server/pentaho-server
sudo -u pentaho ./stop-pentaho.sh
```

2. Create a keystore for the certificate (self-signed here; use your CA's certificate in production).

```bash
sudo -u pentaho mkdir -p /opt/pentaho/server/pentaho-server/tomcat/ssl
sudo -u pentaho "$PENTAHO_JAVA_HOME/bin/keytool" -genkeypair -alias tomcat -keyalg RSA -keysize 2048 -validity 365 \
  -storetype PKCS12 -keystore /opt/pentaho/server/pentaho-server/tomcat/ssl/keystore.p12 \
  -storepass changeit -dname "CN=localhost"
```

3. Add an HTTPS connector: in `server.xml`, replace the commented-out 8443 connector with this one.

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
      secure="true">
  <SSLHostConfig>
    <Certificate certificateKeystoreFile="/opt/pentaho/server/pentaho-server/tomcat/ssl/keystore.p12"
                 certificateKeystorePassword="changeit"
                 certificateKeystoreType="PKCS12"
                 type="RSA" />
  </SSLHostConfig>
</Connector>
```

> **Note:** Tomcat 10.1 reads the keystore from the nested `<Certificate>` element. The older `keystoreFile`, `keystorePass`, `keystoreType`, `clientAuth` and `sslProtocol` attributes on `<Connector>` (still in the commented-out example) are ignored with `failed to set property`, and the connector then fails to start with `No SSLHostConfig element was found`.

4. Update the server URL to the new scheme and port.

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
```

```
fully-qualified-server-url=https://localhost:8443/pentaho/
alternative-fully-qualified-server-urls=https://127.0.0.1:8443/pentaho/
```

5. Start the server and verify: expect `HTTP/1.1 401` (`-k` accepts a self-signed certificate while testing).

```bash
sudo -u pentaho ./start-pentaho.sh
curl -kI https://localhost:8443/pentaho/ | head -n 1
```

</details>

<details>

<summary>Change default HTTP port</summary>

Default port is 8080.

1. Stop the Pentaho Server.

```bash
cd /opt/pentaho/server/pentaho-server
sudo -u pentaho ./stop-pentaho.sh
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
alternative-fully-qualified-server-urls=http://127.0.0.1:8090/pentaho/
```

4. Start the server and verify.

```bash
sudo -u pentaho ./start-pentaho.sh
curl -I http://localhost:8090/pentaho/ | head -n 1
```

</details>

<details>

<summary>Harden or disable the Tomcat shutdown port</summary>

By default the Pentaho Server's Tomcat listens on a local shutdown port for the `SHUTDOWN` command: the `port` of the `<Server>` element in `server.xml` (8005 in the archive, 8012 in installer-built servers). Check yours:

```bash
grep '<Server ' /opt/pentaho/server/pentaho-server/tomcat/conf/server.xml
```

* Change both the port and the shutdown command to unpredictable values, or
* Disable the port by setting `port="-1"`.

> **Warning:** `stop-pentaho.sh` stops Tomcat by sending that command to the shutdown port. With the port disabled the script cannot stop the server, so the systemd unit's `ExecStop` hangs until its timeout and the process is killed. Prefer changing the port and command; disable the port only if something else stops the server.

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

Pentaho already maps 404, 403 and 500 to `/unavailable.html` in the webapp's `web.xml`, so Tomcat's default error pages are not shown. To use your own page, create it and point those existing `<error-page>` entries at it rather than adding a second set.

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

2. In the webapp `web.xml`, change the `<location>` of the three existing `<error-page>` entries:

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

Change the timeout in the existing `<session-config>` of the webapp `web.xml` (the shipped value is 120 minutes). Do not add a second `<session-config>`: Tomcat then refuses to deploy the webapp (`<session-config> element is limited to 1 occurrence`) and `/pentaho` returns 404.

1. Edit the webapp `web.xml` and change the value inside the existing element.

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/WEB-INF/web.xml
```

```xml
<session-timeout>20</session-timeout>
```

2. Restart the server.

</details>

<details>

<summary>Increase Karaf startup wait time</summary>

> **Note:** Karaf was removed from the PDI client in 11.0, but the 11.0 Pentaho Server still ships and starts it (`pentaho-solutions/system/karaf`; `tomcat/logs/karaf.log`). `server.properties` already contains the setting, commented out, at its default of 120000 (2 minutes).

If server startup times out while Karaf installs features, increase the wait time.

1. Stop the server.

```bash
sudo systemctl stop pentaho-server
```

2. Edit `server.properties`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
```

Uncomment and raise:

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

2. Delete the sample zips from default content. The server imports each zip there on start and then renames it with a timestamp (`plugin-samples.zip.202610061459`), so once a zip is imported, deleting it no longer removes its content: step 5 does that.

```bash
sudo rm -f /opt/pentaho/server/pentaho-server/pentaho-solutions/system/default-content/pentaho-samples-ee.zip* \
           /opt/pentaho/server/pentaho-server/pentaho-solutions/system/default-content/plugin-samples.zip*
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

Set the existing key (it ships empty):

```
disabled_widgets=getting-started,recents,favorites
```

3. Start the server and log in to verify.

```bash
sudo systemctl start pentaho-server
```

</details>

<details>

<summary>Turn off autocomplete on the login page (advanced)</summary>

In 11.0 `PUCLogin.jsp` already sets `autocomplete="off"` on both the user name and password inputs. Upgrades replace vendor JSPs, so check it is still there afterwards:

```bash
grep -n 'autocomplete' /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/jsp/PUCLogin.jsp
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

These are the shipped defaults (10 MB per file, 500 MB per folder): raise them as needed.

These are the shipped defaults (10 MB per file, 500 MB per folder): raise them as needed.

2. Change the staging database for CSV files (optional) in `data-access/settings.xml`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/data-access/settings.xml
```

```xml
<!-- settings for Agile Data Access -->
<data-access-staging-jndi>Hibernate</data-access-staging-jndi>
```

3. In PUC, go to Tools → Refresh → System Settings, then restart PUC (or the server) to apply. JNDI names are case-sensitive: the shipped value `Hibernate` matches the `jdbc/Hibernate` resource in `context.xml`.

</details>

***
