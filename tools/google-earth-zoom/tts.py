import sys, asyncio, certifi
certifi.where = lambda: '/root/.ccr/ca-bundle.crt'   # trust the session proxy CA (verification stays on)
import edge_tts
async def main(voice, text, out, rate='+0%'):
    c = edge_tts.Communicate(text, voice, rate=rate)
    await c.save(out)
args = sys.argv[1:]
asyncio.run(main(*args))
