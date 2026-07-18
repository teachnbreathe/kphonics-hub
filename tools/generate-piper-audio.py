import argparse
import json
import wave
from pathlib import Path
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description="Generate K-Phonics word and sentence audio with Piper")
parser.add_argument("--force", action="store_true")
args = parser.parse_args()
manifest = json.loads((ROOT / "tools" / "audio-manifest.json").read_text(encoding="utf-8"))
model = ROOT / ".tools" / "piper-voices" / f"{manifest['voice']}.onnx"
voice = PiperVoice.load(str(model))
config = SynthesisConfig(length_scale=float(manifest["lengthScale"]), normalize_audio=True, volume=1.0)

jobs = []
for letter in manifest["texts"]["letterNames"]:
    jobs.append((letter, ROOT / manifest["letterNames"][letter.lower()]))
for text in manifest["texts"]["words"]:
    jobs.append((text, ROOT / manifest["words"][text.lower()]))
for text in manifest["texts"]["sentences"]:
    jobs.append((text, ROOT / manifest["sentences"][text.lower()]))

created = skipped = 0
for index, (text, output) in enumerate(jobs, 1):
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists() and not args.force:
        skipped += 1
        continue
    with wave.open(str(output), "wb") as wav_file:
        voice.synthesize_wav(text, wav_file, syn_config=config)
    created += 1
    print(f"[{index}/{len(jobs)}] {output.name} <- {text}")
print(f"Done: {created} created, {skipped} skipped, {len(jobs)} total")