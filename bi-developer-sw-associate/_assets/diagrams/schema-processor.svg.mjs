// Overview of Localization, tab 3: what the dynamic schema processor does on
// each connection request, from Analyzer's connection to the schema Mondrian
// caches, with one real token from the course's bundles.
//
// Facts, from the server's own Mondrian (mondrian-11.0.0.3-310.jar, read with
// javap on 2026-11-18):
//   - RolapSchemaPool.get calls getSchemaContent, which runs the processor
//     named by the DynamicSchemaProcessor connection property, on every
//     request and before the cache is consulted.
//   - SchemaContentKey.create keys the schema by the processed text
//     ("catalogStr") when a processor is named, by the catalog URL when not;
//     UseContentChecksum picks getByChecksum (an MD5 of that text) over
//     getByKey.
//   - LocalizingDynamicSchemaProcessor reads the connection's "Locale"
//     property (the JVM default when it is absent), loads the bundle with
//     ResourceBundle.getBundle(localePropFile, locale, ...) and replaces each
//     match of %\{.*?\}.
// And from 16-localization-fr-localization: the bundles' folder, the
// localePropFile value, and the key classicmodels.dimension.customers.
// territory.caption = Territoire (fr) / Territory (en).
//
// Run from this folder:   node schema-processor.svg.mjs
import { Diagram } from '../../../../scripts/diagram-kit.mjs';

const d = new Diagram(1100, 360);
const W = 245, H = 84, GAP = 32, Y = 24;
const X = [16, 16 + (W + GAP), 16 + 2 * (W + GAP), 16 + 3 * (W + GAP)];

const steps = [
  d.box({ x: X[0], y: Y, w: W, h: H, role: 'browser', iconName: 'chart-column', title: 'Analyzer',
    lines: ['opens a connection whose', 'Locale is the session\'s: fr'] }),
  d.box({ x: X[1], y: Y, w: W, h: H, role: 'server', iconName: 'file-code', title: 'Classic Models catalog',
    lines: ['its parameters name the', 'DynamicSchemaProcessor'] }),
  d.box({ x: X[2], y: Y, w: W, h: H, role: 'engine', iconName: 'languages', title: 'Schema processor',
    lines: ['swaps each %{...} token for', 'its text in the fr bundle'] }),
  d.box({ x: X[3], y: Y, w: W, h: H, role: 'engine', iconName: 'cog', title: 'Mondrian',
    lines: ['parses the French text and', 'caches it under that text'] }),
];
for (let i = 0; i < 3; i++) {
  d.arrow({ x1: steps[i].r, y1: steps[i].cy, x2: steps[i + 1].x - 2, y2: steps[i + 1].cy, straight: true });
}

// The bundles the processor reads, under it.
const bundles = d.bar({ x: X[1], y: 156, w: 3 * W + 2 * GAP, h: 60, role: 'store', iconName: 'file-text',
  title: 'MondrianMessages_en.properties, MondrianMessages_fr.properties',
  line: 'WEB-INF\\classes\\com\\pentaho\\messages, found through mondrian.rolap.localePropFile' });
d.arrow({ x1: steps[2].cx, y1: bundles.y, x2: steps[2].cx, y2: steps[2].b + 2, straight: true, label: 'fr bundle' });

// One token, before and after.
d.raw(`<text x="16" y="256" font-size="13" font-weight="700" fill="#334155">One token, before and after</text>`);
d.box({ x: 16, y: 268, w: 640, h: 52, role: 'off', title: 'caption="%{classicmodels.dimension.customers.territory.caption}"' });
d.arrow({ x1: 656, y1: 294, x2: 712, y2: 294, straight: true });
d.box({ x: 714, y: 268, w: 178, h: 52, role: 'model', title: 'caption="Territoire"', center: true });
d.box({ x: 906, y: 268, w: 178, h: 52, role: 'model', title: 'caption="Territory"', center: true });
// The same token gives each session's language its own text.
d.pill(803, 256, 'fr session');
d.pill(995, 256, 'en session');
d.raw(`<text x="550" y="348" text-anchor="middle" font-size="12" fill="#475569">The processor runs on every connection request, before Mondrian looks in its cache: one published file, one cached schema per language.</text>`);

d.write(import.meta.url);
