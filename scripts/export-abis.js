#!/usr/bin/env node
/**
 * Export ABIs from Hardhat artifacts to src/server/abi/
 * Usage: node scripts/export-abis.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '..', 'artifacts', 'contracts');
const ABI_DIR = path.join(__dirname, '..', 'src', 'server', 'abi');

// Mapping of contract directories to ABI output directories
const CONTRACT_MAPPINGS = {
  'AMM': 'AMM',
  'UniswapV1': 'UniswapV1',
  'CurveV1Old': 'CurveV1Old',
  'UniswapV2Factory.sol': 'UniswapV2Factory.json' // Keep existing structure
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function exportAbi(artifactPath, outputPath) {
  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    if (!artifact.abi || !Array.isArray(artifact.abi)) {
      console.warn(`⚠️  No ABI found in ${artifactPath}`);
      return false;
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`✅ Exported: ${path.relative(process.cwd(), outputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to export ${artifactPath}:`, error.message);
    return false;
  }
}

function processDirectory(dir, baseOutputDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let exported = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively process subdirectories
      const subDirName = entry.name;
      let outputSubDir;
      
      if (CONTRACT_MAPPINGS[subDirName]) {
        outputSubDir = path.join(baseOutputDir, CONTRACT_MAPPINGS[subDirName]);
      } else {
        // Default: use directory name
        outputSubDir = path.join(baseOutputDir, subDirName);
      }
      
      ensureDir(outputSubDir);
      exported += processDirectory(fullPath, outputSubDir);
    } else if (entry.name.endsWith('.json')) {
      // Check if this is an artifact file (contains .sol in path)
      const artifactMatch = fullPath.match(/contracts[\\/](.+)[\\/]([^\\/]+)\.sol[\\/]([^\\/]+)\.json$/);
      if (artifactMatch) {
        const [, contractDir, contractName, artifactName] = artifactMatch;
        
        // Only process if artifact name matches contract name (main artifact)
        if (artifactName === contractName) {
          let outputDir = baseOutputDir;
          
          // Determine output directory based on contract directory
          if (contractDir.includes('AMM')) {
            outputDir = path.join(ABI_DIR, 'AMM');
          } else if (contractDir.includes('UniswapV1')) {
            outputDir = path.join(ABI_DIR, 'UniswapV1');
          } else if (contractDir.includes('CurveV1Old')) {
            outputDir = path.join(ABI_DIR, 'CurveV1Old');
          }
          
          ensureDir(outputDir);
          const outputPath = path.join(outputDir, `${contractName}.json`);
          
          if (exportAbi(fullPath, outputPath)) {
            exported++;
          }
        }
      }
    }
  }

  return exported;
}

function main() {
  console.log('📦 Exporting ABIs from Hardhat artifacts...\n');
  
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    console.error(`❌ Artifacts directory not found: ${ARTIFACTS_DIR}`);
    console.error('   Run "npx hardhat compile" first to generate artifacts.');
    process.exit(1);
  }

  ensureDir(ABI_DIR);
  
  // Process each contract directory
  const exported = processDirectory(ARTIFACTS_DIR, ABI_DIR);
  
  console.log(`\n✅ Exported ${exported} ABIs to ${path.relative(process.cwd(), ABI_DIR)}`);
}

main();

