# Post Installation Tasks

> **Warning:**
>
> #### Workshop - Post Installation Tasks
>
> Harden and tune the Pentaho Server after the install. Every task here is optional: open the ones your environment needs.
>
> **What you'll do**
>
> * Check the `Server` header, harden the shutdown port and the login page
> * Serve the User Console over HTTPS, on another port or another context path
> * Change the session timeout, Karaf's startup wait and the CSV upload limits
> * Replace the error pages, remove the sample data and hide Home widgets
>
> **Prerequisites:** The server from [Install Pentaho Server](../06-installation-archive-pentaho-server/guide.md), and optionally its systemd service, `pentaho-server`
>
> **Estimated time:** 10 minutes

---

> **Note:**
>
> #### Post-installation Hardening and Tuning
>
> Each task below is independent: expand it to see its steps. Paths are the archive's, under `/opt/pentaho/server/pentaho-server`.
>
> Stop and start the server as the `pentaho` user (`sudo -u pentaho ./stop-pentaho.sh`), or with `systemctl` if you created the service in **Install Pentaho Server**. Started as root, it leaves root-owned files under `tomcat/logs`, `work` and `temp` that the `pentaho` user can no longer write.

:::: tabs

### 1. Secure the Server

<details>

<summary>Hide the Tomcat Server header</summary>

Tomcat 10.1 sends no `Server` header unless an application sets one, and Pentaho's `server.xml` already hides the version on error pages (`showServerInfo="false"` on the `ErrorReportValve`).

1. Check what your server sends:

```bash
curl -sI http://localhost:8080/pentaho/Login | grep -i '^server:' || echo "no Server header"
```

> **Success:** Checkpoint: `no Server header`, on a server as the archive ships it.

Set the connector's `server` attribute only if a scan still shows a `Server` header, for example one added by a proxy or an application.

2. Open `server.xml`:

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/conf/server.xml
```

3. Add or update the `server` attribute on the HTTP connector, and on the AJP connector if you use it, then save the file:

```xml
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           server=" "
           redirectPort="8443" />
```

4. Restart the Pentaho Server:

```bash
sudo systemctl restart pentaho-server
```

</details>

<details>

<summary>Java Security Manager (deprecated, then removed)</summary>

The legacy Java Security Manager is deprecated for removal: it still works on Java 21 but prints warnings, and from JDK 24 it is permanently disabled. Don't build new hardening on Tomcat's `-security` option. Prefer operating system hardening, least-privilege users, network scoping, and container, AppArmor or SELinux policies as appropriate.

</details>

<details>

<summary>Harden or disable the Tomcat shutdown port</summary>

By default the Pentaho Server's Tomcat listens on a local shutdown port for the `SHUTDOWN` command: the `port` of the `<Server>` element in `server.xml` (`8005` in the archive, `8012` in installer-built servers). You can:

* Change both the port and the shutdown command to unpredictable values, or
* Disable the port by setting `port="-1"`.

1. Check your server's `<Server>` element:

```bash
grep '<Server ' /opt/pentaho/server/pentaho-server/tomcat/conf/server.xml
```

> **Success:** Checkpoint: `<Server port="8005" shutdown="SHUTDOWN">` on the archive.

2. Open `server.xml` and edit the `<Server>` element:

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/conf/server.xml
```

For example, a disabled port:

```xml
<Server port="-1" shutdown="SHUTDOWN">
```

Or a changed port and command:

```xml
<Server port="18005" shutdown="My$tr0ngShutCmd">
```

> **Under the hood:**
>
> #### stop-pentaho.sh stops Tomcat through the shutdown port
>
> Tomcat waits on the `<Server>` port, on `localhost`, for the `shutdown` string; when it reads that string, it shuts down. `stop-pentaho.sh` stops the server by sending it. Anything on the machine that can open the port and send the string can stop the server too, which is why you change both values. With `port="-1"` there is no port: the script can't stop the server, so the systemd unit's `ExecStop` hangs until its timeout and the process is killed.
>
> **Why it matters:** hardening must not break the way you stop the server. Prefer changing the port and the command; disable the port only if something else stops the server.

3. Restart the Pentaho Server:

```bash
sudo systemctl restart pentaho-server
```

</details>

<details>

<summary>Change to HTTPS</summary>

The server answers on HTTP, port `8080`, by default. Here you add an HTTPS connector on port `8443`.

1. Stop the Pentaho Server:

```bash
cd /opt/pentaho/server/pentaho-server
sudo -u pentaho ./stop-pentaho.sh
```

2. Create a keystore for the certificate (self-signed here; use your certificate authority's certificate in production):

```bash
sudo -u pentaho mkdir -p /opt/pentaho/server/pentaho-server/tomcat/ssl
sudo -u pentaho "$PENTAHO_JAVA_HOME/bin/keytool" -genkeypair -alias tomcat -keyalg RSA -keysize 2048 -validity 365 \
  -storetype PKCS12 -keystore /opt/pentaho/server/pentaho-server/tomcat/ssl/keystore.p12 \
  -storepass changeit -dname "CN=localhost"
```

> **Success:** Checkpoint: `Generating 2,048 bit RSA key pair and self-signed certificate (SHA384withRSA) with a validity of 365 days`, then `for: CN=localhost`.

3. Open `server.xml`, and replace the commented-out 8443 connector with this one:

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

> **Under the hood:**
>
> #### Tomcat 10.1 reads the keystore from SSLHostConfig, not from the connector
>
> In Tomcat 10.1 each TLS host of a connector is an `<SSLHostConfig>`, and its certificate a nested `<Certificate>`. The older `keystoreFile`, `keystorePass`, `keystoreType`, `clientAuth` and `sslProtocol` attributes on `<Connector>`, which the commented-out example in `server.xml` still uses, are ignored with a `failed to set property` warning each, and the connector then fails to start with `No SSLHostConfig element was found`.
>
> **Why it matters:** with the old attributes the server still starts, on HTTP only, so HTTPS fails with nothing more than warnings in `catalina.*.log`. Look there for `https-jsse-nio-8443` when HTTPS doesn't answer.

4. Update the server URL to the new scheme and port:

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
```

```properties
fully-qualified-server-url=https://localhost:8443/pentaho/
alternative-fully-qualified-server-urls=https://127.0.0.1:8443/pentaho/
```

5. Start the server, and check HTTPS (`-k` accepts a self-signed certificate while you test):

```bash
sudo -u pentaho ./start-pentaho.sh
curl -kI https://localhost:8443/pentaho/ | head -n 1
```

> **Success:** Checkpoint: `HTTP/1.1 401`, and `catalina.*.log` shows `Starting ProtocolHandler ["https-jsse-nio-8443"]`.

</details>

<details>

<summary>Turn off autocomplete on the login page (advanced)</summary>

In 11.0, `PUCLogin.jsp` already sets `autocomplete="off"` on both the user name and the password inputs. Upgrades replace the vendor JSPs, so check it is still there after an upgrade.

1. Run:

```bash
grep -n 'autocomplete' /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/jsp/PUCLogin.jsp
```

> **Success:** Checkpoint: two lines, for the `j_username` input and the password input, each with `autocomplete="off"`.

</details>

### 2. Change Addresses and Ports

<details>

<summary>Change the web application context path</summary>

Change the context path if you don't want the application at `/pentaho`. The example moves it to `/company`.

> **Warning:** Upgrades may overwrite deployed webapps. Reapply these changes after an upgrade, or map the path in a reverse proxy instead.

1. Stop the Pentaho Server:

```bash
cd /opt/pentaho/server/pentaho-server
sudo -u pentaho ./stop-pentaho.sh
```

2. Open `context.xml`:

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/META-INF/context.xml
```

3. In the opening `<Context ...>` tag, change `/pentaho` to `/company` in both attributes, then save the file. Keep the `<Resource>` elements inside it: they are the server's database connections, and replacing the element with a self-closing one deletes them.

```xml
<Context path="/company" docbase="webapps/company/">
```

4. Rename the webapp folder to the new context name:

```bash
sudo mv /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho \
        /opt/pentaho/server/pentaho-server/tomcat/webapps/company
```

> **Under the hood:**
>
> #### The folder name sets the path
>
> Tomcat takes a web application's context path from its folder name under `webapps`: the folder `company` is served at `/company`. It ignores the `path` and `docbase` attributes in `META-INF/context.xml`, and its log says so (`failed to set property [docbase]`). Step 3 changes them only to keep the file consistent with the folder.
>
> **Why it matters:** the rename in step 4 is the change that counts. Forget it, and the server keeps answering at `/pentaho` whatever `context.xml` says.

5. Update the redirect in `ROOT/index.jsp`:

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/ROOT/index.jsp
```

Change the meta refresh to:

```html
<meta http-equiv="refresh" content="0;URL=/company">
```

6. Update the server URL:

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
```

```properties
fully-qualified-server-url=http://localhost:8080/company/
alternative-fully-qualified-server-urls=http://127.0.0.1:8080/company/
```

7. Start the server, and test the new path:

```bash
sudo -u pentaho ./start-pentaho.sh
curl -I http://localhost:8080/company/ | head -n 1
```

> **Success:** Checkpoint: the server answers at `/company` with an HTTP status line, not `404`, and `http://localhost:8080` redirects to `/company`.

</details>

<details>

<summary>Change the default HTTP port</summary>

The default port is `8080`. The example moves it to `8090`.

1. Stop the Pentaho Server:

```bash
cd /opt/pentaho/server/pentaho-server
sudo -u pentaho ./stop-pentaho.sh
```

2. Open `server.xml` and change the connector's `port`:

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

3. Update the server URL:

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
```

```properties
fully-qualified-server-url=http://localhost:8090/pentaho/
alternative-fully-qualified-server-urls=http://127.0.0.1:8090/pentaho/
```

4. Start the server and check the new port:

```bash
sudo -u pentaho ./start-pentaho.sh
curl -I http://localhost:8090/pentaho/ | head -n 1
```

> **Success:** Checkpoint: `HTTP/1.1 401`, the answer port `8080` gave before.

</details>

### 3. Tune the Server

<details>

<summary>Session timeout</summary>

Change the timeout in the existing `<session-config>` of the webapp's `web.xml` (the shipped value is `120` minutes). Don't add a second `<session-config>`: Tomcat then refuses to deploy the webapp (`<session-config> element is limited to 1 occurrence`) and `/pentaho` returns `404`.

1. Open the webapp's `web.xml` and change the value inside the existing element, for example to 20 minutes:

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/WEB-INF/web.xml
```

```xml
<session-timeout>20</session-timeout>
```

2. Check that the file has one timeout, with your value:

```bash
grep -n '<session-timeout>' /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/WEB-INF/web.xml
```

> **Success:** Checkpoint: one line, `<session-timeout>20</session-timeout>`.

3. Restart the server:

```bash
sudo systemctl restart pentaho-server
```

</details>

<details>

<summary>Increase Karaf's startup wait time</summary>

Karaf was removed from the PDI client in 11.0, but the 11.0 Pentaho Server still ships and starts it (`pentaho-solutions/system/karaf`; `tomcat/logs/karaf.log`). `server.properties` already contains the setting, commented out, at its default of `120000` (2 minutes). If the server's startup times out while Karaf installs features, raise it.

1. Stop the server:

```bash
sudo systemctl stop pentaho-server
```

2. Open `server.properties`:

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/server.properties
```

3. Uncomment the setting and raise it, for example to 3 minutes, then save the file:

```properties
# Time (ms) to wait for Karaf to install features before timing out
karafWaitForBoot=180000
```

4. Start the server:

```bash
sudo systemctl start pentaho-server
```

</details>

<details>

<summary>Increase the CSV upload limits</summary>

Change the upload limits and, optionally, the staging database for uploaded CSV files.

1. Open `pentaho.xml`:

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/pentaho.xml
```

2. In `<file-upload-defaults>`, raise the limits as needed. These are the shipped defaults, 10 MB per file and 500 MB per folder:

```xml
<file-upload-defaults>
  <relative-path>/system/metadata/csvfiles/</relative-path>
  <max-file-limit>10000000</max-file-limit>
  <max-folder-limit>500000000</max-folder-limit>
</file-upload-defaults>
```

3. Optionally, change the staging database for CSV files in `data-access/settings.xml`. JNDI names are case-sensitive: the shipped value, `Hibernate`, matches the `jdbc/Hibernate` resource in `context.xml`.

```bash
sudo nano /opt/pentaho/server/pentaho-server/pentaho-solutions/system/data-access/settings.xml
```

```xml
<!-- settings for Agile Data Access -->
<data-access-staging-jndi>Hibernate</data-access-staging-jndi>
```

4. In the classic User Console, select **Tools > Refresh > System Settings**.

> **Success:** Checkpoint: *System settings refreshed successfully.*

5. Restart the User Console session (or the server) to apply the change.

</details>

### 4. Prepare for Users

<details>

<summary>Custom error pages (404, 403, 500)</summary>

Pentaho already maps 404, 403 and 500 to `/unavailable.html` in the webapp's `web.xml`, so Tomcat's default error pages are never shown. To use your own page, create it and point those existing `<error-page>` entries at it, rather than adding a second set.

1. Create an error page in the webapp:

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

2. Open the webapp's `web.xml`, and change the `<location>` of the three existing `<error-page>` entries:

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

3. Restart the server:

```bash
sudo systemctl restart pentaho-server
```

> **Success:** Checkpoint: a request that fails with a 404, 403 or 500 error now shows your page, *Something went wrong*, instead of `unavailable.html`.

</details>

<details>

<summary>Remove the sample data from the server</summary>

Remove the evaluation samples before you move to production.

1. Stop the server:

```bash
sudo systemctl stop pentaho-server
```

2. Delete the sample zips from the default content. The server imports each zip there when it starts, then renames it with a timestamp (for example `plugin-samples.zip.202610061459`), so deleting an imported zip no longer removes its content: step 5 does that.

```bash
sudo rm -f /opt/pentaho/server/pentaho-server/pentaho-solutions/system/default-content/pentaho-samples-ee.zip* \
           /opt/pentaho/server/pentaho-server/pentaho-solutions/system/default-content/plugin-samples.zip*
```

3. Open the webapp's `web.xml` and remove the HSQLDB sample definitions and the `SystemStatusFilter` (development only):

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/WEB-INF/web.xml
```

Remove blocks like these:

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

4. Optionally, remove the server's `data/` directory, if it only held sample content (check your environment before you delete it):

```bash
sudo rm -rf /opt/pentaho/server/pentaho-server/data || true
```

5. Start the server:

```bash
sudo systemctl start pentaho-server
```

6. In the classic User Console's **Browse Files**, open the **Public** folder, right-click each sample folder and select **Move to Trash**, then confirm with **Yes, Move to Trash**.

</details>

<details>

<summary>Hide the Home page widgets</summary>

Hide **Getting Started** and the other widgets on the classic User Console's Home page.

1. Stop the server:

```bash
sudo systemctl stop pentaho-server
```

2. Open the Home perspective's configuration:

```bash
sudo nano /opt/pentaho/server/pentaho-server/tomcat/webapps/pentaho/mantle/home/properties/config.properties
```

3. Set the existing key (it ships empty), then save the file:

```properties
disabled_widgets=getting-started,recents,favorites
```

4. Start the server and log in to check the Home page:

```bash
sudo systemctl start pentaho-server
```

> **Success:** Checkpoint: the classic console's Home page no longer shows **Getting Started** or the lists of recent and favorite files.

</details>

::::

## Lab Files

_No bundled files for this lab._
