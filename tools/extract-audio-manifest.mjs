import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
let source = fs.readFileSync(path.join(root, "js", "data.js"), "utf8");
source = source.replace(/\bconst\b/g, "var").replace(/\blet\b/g, "var");
const context = { console };
vm.createContext(context);
vm.runInContext(source, context, { filename: "data.js" });

const words = new Set();
const sentences = new Set();
const english = value => typeof value === "string" && /[A-Za-z]/.test(value) && !/[가-힣]/.test(value);
const clean = value => String(value).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

function walk(value, key = "") {
  if (Array.isArray(value)) {
    value.forEach(item => {
      if (typeof item === "string" && key === "pyramid" && english(item)) sentences.add(clean(item));
      else walk(item, key);
    });
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [childKey, child] of Object.entries(value)) {
    if (typeof child === "string" && english(child)) {
      const text = clean(child);
      if (childKey === "word") words.add(text);
      if (["sentence", "text", "q"].includes(childKey) && text.includes(" ")) sentences.add(text);
    }
    walk(child, childKey);
  }
}
Object.entries(context).filter(([key]) => key.startsWith("KP_")).forEach(([, value]) => walk(value));

const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const wordList = [...words].sort((a, b) => a.localeCompare(b));
const sentenceList = [...sentences].sort((a, b) => a.localeCompare(b));
const manifest = {
  voice: "en_US-lessac-medium",
  lengthScale: 1.18,
  letterNames: Object.fromEntries(letters.map(letter => [letter, `assets/audio/letter-names/${letter}.wav`])),
  words: Object.fromEntries(wordList.map(text => [text.toLowerCase(), `assets/audio/words/${slug(text)}.wav`])),
  sentences: Object.fromEntries(sentenceList.map(text => [text.toLowerCase(), `assets/audio/sentences/${slug(text)}.wav`]))
};
fs.writeFileSync(path.join(root, "tools", "audio-manifest.json"), JSON.stringify({ ...manifest, texts: { letterNames: letters.map(x => x.toUpperCase()), words: wordList, sentences: sentenceList } }, null, 2));
const browserManifest = { letterName: manifest.letterNames, word: manifest.words, sentence: manifest.sentences };
fs.writeFileSync(path.join(root, "js", "generated-audio.js"), `/* Piper generated audio map — do not edit manually. */\nconst KP_GENERATED_AUDIO = ${JSON.stringify(browserManifest, null, 2)};\n`);
console.log(`Audio manifest: ${letters.length} letter names, ${wordList.length} words, ${sentenceList.length} sentences`);