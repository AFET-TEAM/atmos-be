/**
 * Console.log Temizleme Scripti
 *
 * Kullanım:
 *   bun run scripts/clean-console-logs.ts
 *   bun run scripts/clean-console-logs.ts --dry-run  (sadece listele, silme)
 *
 * Bu script:
 * - console.log satırlarını kaldırır
 * - console.error satırlarını KORUR (bunlar önemli)
 * - console.warn satırlarını KORUR
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { extname, join } from "path";

const EXTENSIONS = [".ts", ".tsx", ".svelte", ".astro", ".js", ".jsx"];
const IGNORE_DIRS = ["node_modules", ".git", "dist", "build", ".astro"];

// console.log pattern - tek satır ve çok satırlı
const CONSOLE_LOG_PATTERNS = [
  // Tek satır console.log
  /^\s*console\.log\([^)]*\);?\s*$/gm,
  // Çok satırlı console.log
  /^\s*console\.log\([^;]*\);?\s*$/gm,
  // $: console.log (Svelte reactive)
  /^\s*\$:\s*console\.log\([^)]*\);?\s*$/gm,
];

interface CleanResult {
  file: string;
  removed: number;
  lines: string[];
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.includes(entry.name)) {
          files.push(...(await getAllFiles(fullPath)));
        }
      } else if (EXTENSIONS.includes(extname(entry.name))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or no permission
  }

  return files;
}

function findConsoleLogs(content: string): {
  cleaned: string;
  removed: string[];
} {
  const lines = content.split("\n");
  const removed: string[] = [];
  const cleanedLines: string[] = [];

  let inMultiLineConsole = false;
  let multiLineBuffer = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // console.log başlangıcı
    if (
      trimmed.startsWith("console.log(") ||
      trimmed.startsWith("$: console.log(")
    ) {
      // Tek satırda bitiyor mu?
      if (trimmed.endsWith(");") || trimmed.endsWith(")")) {
        removed.push(`Line ${i + 1}: ${trimmed}`);
        continue;
      } else {
        // Çok satırlı başlangıç
        inMultiLineConsole = true;
        multiLineBuffer = trimmed;
        continue;
      }
    }

    if (inMultiLineConsole) {
      multiLineBuffer += " " + trimmed;
      if (trimmed.endsWith(");") || trimmed.endsWith(")")) {
        removed.push(`Line ${i + 1}: ${multiLineBuffer.substring(0, 80)}...`);
        inMultiLineConsole = false;
        multiLineBuffer = "";
      }
      continue;
    }

    cleanedLines.push(line);
  }

  return {
    cleaned: cleanedLines.join("\n"),
    removed,
  };
}

async function cleanFile(
  filePath: string,
  dryRun: boolean,
): Promise<CleanResult | null> {
  const content = await readFile(filePath, "utf-8");
  const { cleaned, removed } = findConsoleLogs(content);

  if (removed.length === 0) return null;

  if (!dryRun) {
    await writeFile(filePath, cleaned, "utf-8");
  }

  return {
    file: filePath,
    removed: removed.length,
    lines: removed,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("🧹 Console.log Temizleyici");
  console.log(
    dryRun
      ? "📋 DRY RUN - Sadece listeleme yapılacak\n"
      : "🗑️  Silme modu aktif\n",
  );

  const srcDir = join(process.cwd(), "src");
  const files = await getAllFiles(srcDir);

  console.log(`📁 ${files.length} dosya taranıyor...\n`);

  let totalRemoved = 0;
  const results: CleanResult[] = [];

  for (const file of files) {
    const result = await cleanFile(file, dryRun);
    if (result) {
      results.push(result);
      totalRemoved += result.removed;
    }
  }

  // Sonuçları göster
  for (const result of results) {
    const relativePath = result.file.replace(process.cwd(), "");
    console.log(`📄 ${relativePath}`);
    console.log(`   ❌ ${result.removed} console.log kaldırıldı`);
    for (const line of result.lines.slice(0, 3)) {
      console.log(
        `      - ${line.substring(0, 70)}${line.length > 70 ? "..." : ""}`,
      );
    }
    if (result.lines.length > 3) {
      console.log(`      ... ve ${result.lines.length - 3} tane daha`);
    }
    console.log();
  }

  console.log("═".repeat(50));
  console.log(
    `✅ Toplam: ${results.length} dosyada ${totalRemoved} console.log ${dryRun ? "bulundu" : "kaldırıldı"}`,
  );

  if (dryRun) {
    console.log("\n💡 Silmek için: bun run scripts/clean-console-logs.ts");
  }
}

main().catch(console.error);
