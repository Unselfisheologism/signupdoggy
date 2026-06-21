// ── TownSquare ────────────────────────────────────────────────────────────────
// Footer widget from townsquare.cauenapier.com. Loaded dynamically as an ES
// module after React mounts the host <div>, so React's hydration never has to
// reason about a <script type="module"> child. The widget script is fetched
// from the third-party CDN at runtime and removed on unmount.
//
// Render once per page. The CSS link is loaded async from index.html so the
// stylesheet never blocks first paint (see preload + onload='this.media=all').
//
// Theme overrides live in src/styles.css under the TOWNSQUARE section.

import { useEffect } from 'react';

const MOUNT_SCRIPT = `import { mountTownSquare } from "https://townsquare.cauenapier.com/townsquare.mjs";
mountTownSquare(document.getElementById("townsquare-root"), {
  serverOrigin: "https://townsquare.cauenapier.com",
  siteKey: "site__1BzllsokQYI7JEt",
  scene: {"benches":2,"benchXs":[0.2,0.72],"trees":1,"treeXs":[0.8],"lamps":1,"lampXs":[0.12],"birds":3},
  theme: "host"
});`;

export default function TownSquare() {
  useEffect(() => {
    const s = document.createElement('script');
    s.type = 'module';
    s.textContent = MOUNT_SCRIPT;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);

  return <div id="townsquare-root" className="townsquare-mount" />;
}
