const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const USER_ID = "saanvimahika_02042005";
const EMAIL = "sm9511@srmist.edu.in";
const ROLL = "RA2311003012125";

function processData(data) {
  const invalid_entries = [];
  const duplicate_edges = [];
  const seen = new Set();
  const validEdges = [];

  for (let raw of data) {
    const entry = String(raw).trim();
    const match = entry.match(/^([A-Z])->([A-Z])$/);
    if (!match || match[1] === match[2]) {
      invalid_entries.push(raw);
      continue;
    }
    if (seen.has(entry)) {
      if (!duplicate_edges.includes(entry)) duplicate_edges.push(entry);
    } else {
      seen.add(entry);
      validEdges.push([match[1], match[2]]);
    }
  }

  const parentOf = {};
  const children = {};
  const allNodes = new Set();

  for (const [p, c] of validEdges) {
    allNodes.add(p);
    allNodes.add(c);
    if (parentOf[c] !== undefined) continue;
    parentOf[c] = p;
    if (!children[p]) children[p] = [];
    children[p].push(c);
  }

  const visited = new Set();
  const components = [];

  for (const node of [...allNodes].sort()) {
    if (visited.has(node)) continue;
    const comp = [];
    const queue = [node];
    while (queue.length) {
      const n = queue.shift();
      if (visited.has(n)) continue;
      visited.add(n);
      comp.push(n);
      const kids = children[n] || [];
      for (const c of kids) queue.push(c);
      for (const [p, ch] of validEdges) {
        if (ch === n && !visited.has(p)) queue.push(p);
      }
    }
    components.push(comp);
  }

  function hasCycle(nodes) {
    const compSet = new Set(nodes);
    const color = {};
    for (const n of nodes) color[n] = 0;
    function dfs(n) {
      color[n] = 1;
      for (const c of (children[n] || [])) {
        if (!compSet.has(c)) continue;
        if (color[c] === 1) return true;
        if (color[c] === 0 && dfs(c)) return true;
      }
      color[n] = 2;
      return false;
    }
    for (const n of nodes) {
      if (color[n] === 0 && dfs(n)) return true;
    }
    return false;
  }

  function buildTree(root) {
    const obj = {};
    for (const c of (children[root] || [])) {
      obj[c] = buildTree(c);
    }
    return obj;
  }

  function getDepth(root) {
    const kids = children[root] || [];
    if (!kids.length) return 1;
    return 1 + Math.max(...kids.map(getDepth));
  }

  const hierarchies = [];

  for (const comp of components) {
    const roots = comp.filter(n => parentOf[n] === undefined);
    const cyclic = hasCycle(comp);
    const root = roots.length > 0 ? roots.sort()[0] : comp.sort()[0];

    if (cyclic) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      hierarchies.push({ root, tree: { [root]: buildTree(root) }, depth: getDepth(root) });
    }
  }

  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  const trees = hierarchies.filter(h => !h.has_cycle);
  const cycles = hierarchies.filter(h => h.has_cycle);

  let largest_tree_root = "";
  let maxDepth = -1;
  for (const t of trees) {
    if (t.depth > maxDepth || (t.depth === maxDepth && t.root < largest_tree_root)) {
      maxDepth = t.depth;
      largest_tree_root = t.root;
    }
  }

  return {
    user_id: USER_ID,
    email_id: EMAIL,
    college_roll_number: ROLL,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees: trees.length,
      total_cycles: cycles.length,
      largest_tree_root
    }
  };
}

app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "data must be an array" });
    }
    res.json(processData(data));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: "ok", message: "BFHL API running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});
