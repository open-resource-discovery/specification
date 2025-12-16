import fs from 'node:fs';
import path from 'node:path';

// Config: what gets cleaned
const config = {
  // Directories to remove entirely
  removeDirs: [
    'dist',
    'build',
    '.docusaurus',
    'src/generated',
    'logs',
    'tmp'
  ],
  // Files to remove (absolute or workspace-relative)
  removeFiles: [
    // Log files in root
    '*.log',
    'npm-debug.log*',
    // Static generated schema artifacts
    'static/spec-v1/interfaces/Configuration.schema.json',
    'static/spec-v1/interfaces/Document.schema.json'
  ],
  // Folders where we remove all contents except certain keepers
  cleanFoldersExcept: [
    {
      dir: 'docs/spec-v1/examples',
      keep: new Set(['index.mdx'])
    },
    {
      dir: 'docs/spec-v1/diagrams',
      keep: new Set(['index.mdx'])
    }
  ],
  // Specific generated MD files noted in .gitignore
  removeGeneratedDocs: [
    'docs/spec-v1/interfaces/Configuration.md',
    'docs/spec-v1/interfaces/Document.md'
  ]
};

const workspaceRoot = process.cwd();

function resolve(p) {
  return path.resolve(workspaceRoot, p);
}

async function removeDir(dirPath) {
  try {
    await fs.promises.rm(resolve(dirPath), { recursive: true, force: true });
    console.log(`removed directory: ${dirPath}`);
  } catch (err) {
    // silently skip if not found
  }
}

async function removeFile(filePath) {
  const abs = resolve(filePath);
  try {
    await fs.promises.rm(abs, { force: true });
    console.log(`removed file: ${filePath}`);
  } catch (err) {
    // silently skip if not found (glob patterns handled separately)
  }
}

async function removeFilesWithPattern(pattern) {
  // Very simple glob handling for patterns like "*.log" and "npm-debug.log*" at workspace root
  const rootEntries = await fs.promises.readdir(workspaceRoot).catch(() => []);
  const toDelete = rootEntries.filter((name) => {
    if (pattern === '*.log') return name.endsWith('.log');
    if (pattern === 'npm-debug.log*') return name.startsWith('npm-debug.log');
    return false;
  });
  await Promise.all(
    toDelete.map((name) => fs.promises.rm(path.join(workspaceRoot, name), { force: true }))
  );
  toDelete.forEach((name) => console.log(`removed file: ${name}`));
}

async function cleanFolderExcept(dir, keep) {
  const absDir = resolve(dir);
  try {
    const entries = await fs.promises.readdir(absDir, { withFileTypes: true });
    await Promise.all(
      entries.map(async (ent) => {
        if (keep.has(ent.name)) return;
        const target = path.join(absDir, ent.name);
        if (ent.isDirectory()) {
          await fs.promises.rm(target, { recursive: true, force: true });
        } else {
          await fs.promises.rm(target, { force: true });
        }
        console.log(`removed entry: ${path.relative(workspaceRoot, target)}`);
      })
    );
  } catch (err) {
    // silently skip if folder does not exist
  }
}

async function main() {
  // Remove directories
  for (const d of config.removeDirs) {
    await removeDir(d);
  }

  // Remove root-level log patterns
  for (const f of config.removeFiles) {
    if (f.includes('*')) {
      await removeFilesWithPattern(f);
    } else {
      await removeFile(f);
    }
  }

  // Remove specifically generated docs
  for (const f of config.removeGeneratedDocs) {
    await removeFile(f);
  }

  // Clean folders except keepers
  for (const { dir, keep } of config.cleanFoldersExcept) {
    await cleanFolderExcept(dir, keep);
  }

  console.log('clean complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
