import sys, numpy as np, torch, cv2
from transformers import pipeline
from PIL import Image
torch.set_num_threads(4)
pipe = pipeline('depth-estimation', model='depth-anything/Depth-Anything-V2-Small-hf', device='cpu')
for f in sys.argv[1:]:
    im = Image.open(f).convert('RGB')
    out = pipe(im)['predicted_depth'].squeeze().numpy().astype(np.float32)
    out = cv2.resize(out, im.size, interpolation=cv2.INTER_CUBIC)
    out = (out - out.min()) / (out.max() - out.min() + 1e-6)     # 1 = near
    np.save(f.rsplit('.',1)[0] + '_depth.npy', out)
    cv2.imwrite(f.rsplit('.',1)[0] + '_depth.png', (out * 255).astype(np.uint8))
    print('ok', f, out.shape)
