// Creating a CDA: what happens to one doQuery request. A dashboard or an
// external application calls doQuery; CDA checks its cache; a hit
// returns the cached rows; a miss runs the DataAccess over its
// Connection, reshapes the rows with Columns and Output, keeps them in
// the cache when caching is on, and returns them. It replaces the
// third-party architecture picture (cda_create_community_data_access.png)
// at the top of 05-community-data-access-creating-a-cda/guide.md.
//
// Facts it encodes, and the lesson each comes from:
//   - Lesson 05, "How CDA serves data": when a dashboard (CDF or CDE) or
//     an external application requests data through CDA's endpoints, CDA
//     first checks whether the query is cached; if the cached result for
//     that query and those parameter values is still valid it returns
//     it; only when no valid cached result exists does CDA query the
//     data source. The sources: SQL over JDBC or JNDI, MDX over Mondrian
//     or olap4j, MQL over Pentaho metadata, Kettle transformations,
//     scripting, XPath, compound queries.
//   - Lesson 05, tab 3, doQuery: doQuery needs path and dataAccessId;
//     each parameter is passed as param followed by its name
//     (paramstatus=Cancelled); outputType is json (the default), xml,
//     csv, xls or html; bypassCache=true runs the query against the
//     database instead of using a cached result. "A dashboard's data
//     arrives through doQuery": every CDF and CDE component fetches its
//     data with this endpoint. Tab 3 note: CDA's web API lets any
//     application use the queries, with or without CDE and CDF.
//   - Lesson 06, "What goes into a cache key": CDA keys a cached result
//     on the connection, the query text, its type and every parameter
//     value, sorted by name, plus any Key entries from a Cache element;
//     for MDX it adds the Mondrian role.
//   - Lesson 05, "Creating Data Access": cache="true" turns caching on;
//     cacheDuration is how long, in seconds, a cached result is kept
//     before the query runs again; without cache or a <Cache> element
//     the query is not cached. Each DataAccess names a connection id
//     from DataSources.
//   - Lesson 05, "CDA runs your SQL through the reporting engine" and
//     "SQL binds a parameter; MDX pastes it": SQL replaces every
//     ${param} with a JDBC bind marker, ?, and sends the value
//     separately; MDX has no bind markers, so CDA writes the value into
//     the query text before Mondrian parses it. The rows that come back
//     are reshaped in order: Column entries rename by position,
//     CalculatedColumn formulas add columns, Output picks and orders
//     what is returned.
//
// Run from this folder:   node cda-request.svg.mjs
// It writes cda-request.svg here and ../images/cda-request.png at twice
// the size.
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

// The canvas: 800 wide, the reading column.
const d = new Diagram(800, 536);
// The four steps inside CDA share one size.
const SW = 210, SH = 120;

// Left column: the two kinds of caller. A dashboard runs in the browser
// (amber); an external application is a tool of yours (blue).
const dash = d.box({ x: 16, y: 80, w: 220, h: 84, role: 'browser', iconName: 'layout-dashboard', title: 'Dashboard', lines: ['every CDF or CDE', 'component calls doQuery'] });
const app = d.box({ x: 16, y: 196, w: 220, h: 84, role: 'tool', iconName: 'app-window', title: 'External app', lines: ['one HTTP request to', '.../plugin/cda/api/doQuery'] });

// What a doQuery request carries (slate, supporting detail).
const req = d.box({ x: 16, y: 326, w: 220, h: 112, role: 'support', iconName: 'list-filter', title: 'The request', lines: ['path, dataAccessId,', 'param<name>=<value>,', 'outputType; bypassCache', '=true skips the cache'] });

// CDA itself, on the Pentaho Server (violet).
d.panel({ x: 260, y: 16, w: 524, h: 404, role: 'server', iconName: 'database-zap', title: 'CDA', sub: 'on the Pentaho Server' });

// Step 1, the cache check (amber, a check), and the rows it returns on a
// hit (white, the result).
const chk = d.box({ x: 276, y: 80, w: SW, h: SH, role: 'check', iconName: 'key-round', title: 'Cache key', lines: ['connection, query text,', 'type, parameter values', 'and Key entries; MDX', 'also adds Mondrian role'] });
const res = d.box({ x: 558, y: 80, w: SW, h: SH, role: 'result', iconName: 'table', title: 'Rows back', lines: ['to the caller: json by', 'default; or xml, csv,', 'xls, html (outputType)'] });

// Step 2 on a miss: run the query (violet), then reshape it (teal).
const run = d.box({ x: 276, y: 280, w: SW, h: SH, role: 'server', iconName: 'cog', title: 'Run the DataAccess', lines: ['over its Connection;', 'SQL: ${x} becomes ?', 'and the value is bound;', 'MDX: value pasted in'] });
const shp = d.box({ x: 558, y: 280, w: SW, h: SH, role: 'join', iconName: 'columns-3', title: 'Reshape', lines: ['Column renames,', 'CalculatedColumn adds,', 'Output picks, orders'] });

// Both callers send doQuery into the cache check.
d.arrow({ x1: dash.r, y1: dash.cy, x2: chk.x - 3, y2: chk.cy - 20 });
d.arrow({ x1: app.r, y1: app.cy, x2: chk.x - 3, y2: chk.cy + 20 });

// A valid cached result: straight back.
d.arrow({ x1: chk.r, y1: chk.cy, x2: res.x - 3, y2: res.cy, straight: true, label: 'hit' });
// No valid cached result: run the query.
d.arrow({ x1: chk.cx, y1: chk.b, x2: run.cx, y2: run.y - 3, vertical: true, label: 'miss' });
// bypassCache=true goes straight to the query (dashed: only on request).
d.arrow({ x1: req.r, y1: req.cy, x2: run.x - 3, y2: run.cy + 20, dashed: true });
// The rows go to be reshaped.
d.arrow({ x1: run.r, y1: run.cy, x2: shp.x - 3, y2: shp.cy, straight: true, label: 'rows' });
// Reshaped rows are kept in the cache (when caching is on) and returned.
d.arrow({ x1: shp.cx, y1: shp.y, x2: res.cx, y2: res.b + 3, vertical: true, label: ['kept cacheDuration', 'seconds if cache="true"'] });

// Underneath: the data sources a DataAccess reaches (green, a store).
const src = d.bar({ x: 260, y: 446, w: 524, h: 72, role: 'store', iconName: 'database', title: 'Data sources', line: 'SQL, Mondrian or olap4j, metadata, Kettle, scripting, XPath' });
d.arrow({ x1: run.cx, y1: run.b, x2: run.cx, y2: src.y - 3, vertical: true });

d.write(import.meta.url);
