"""Transcreve a narração com tempo por palavra (Vosk, português).

Uso:  python3 scripts/transcrever.py <audio> <saida.json>
Saída: [{"palavra": "titanic", "inicio": 0.42, "fim": 0.9}, ...]  (segundos)

Preparação (uma vez por sessão):
  pip install --no-deps vosk && pip install cffi requests tqdm websockets
  # o vosk importa 'srt', cujo pacote não compila aqui; um módulo vazio basta:
  mkdir -p /tmp/stub && touch /tmp/stub/srt.py   (rodar com PYTHONPATH=/tmp/stub)
  curl -sSLO https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip && unzip -q vosk-model-small-pt-0.3.zip
  export VOSK_MODEL=$PWD/vosk-model-small-pt-0.3
Precisa de ffmpeg (converte qualquer áudio para wav 16 kHz mono).
"""
import json, os, subprocess, sys, tempfile, wave

from vosk import KaldiRecognizer, Model, SetLogLevel


def main(audio: str, saida: str) -> None:
    SetLogLevel(-1)
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "a.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", audio, "-ac", "1", "-ar", "16000", wav], check=True)
        w = wave.open(wav)
        rec = KaldiRecognizer(Model(os.environ.get("VOSK_MODEL", "vosk-model-small-pt-0.3")), w.getframerate())
        rec.SetWords(True)
        partes = []
        while data := w.readframes(4000):
            if rec.AcceptWaveform(data):
                partes.append(json.loads(rec.Result()))
        partes.append(json.loads(rec.FinalResult()))
    palavras = [
        {"palavra": p["word"], "inicio": round(p["start"], 3), "fim": round(p["end"], 3)}
        for parte in partes for p in parte.get("result", [])
    ]
    with open(saida, "w", encoding="utf-8") as f:
        json.dump(palavras, f, ensure_ascii=False, indent=1)
    print(f"{len(palavras)} palavras → {saida}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
