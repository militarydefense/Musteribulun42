import sys; sys.argv=['x','A','/dev/null']
src=open('anim.py').read().split("f = frame_A if MODE")[0]
exec(src)
import cv2, numpy as np
atl=atlantis(1.2); s_=sat.copy()
# split: top = Atlantis illustration, bottom = real satellite, both centred on the rings
def crop_centered(img, y_center, h):
    y0=int(y_center-h/2); return img[max(0,y0):y0+h]
H=OH//2
top=crop_centered(atl,cy,H); bot=crop_centered(s_,cy,H)
fr=np.vstack([top,bot]).astype(np.float32)
fr[H-6:H+6]=255
fr=draw_text(fr,[([("PLATO'S ATLANTIS",(90,205,255))],120,92,1,1),
                 ([("THE SAHARA TODAY",(255,138,31))],H+60,92,1,1),
                 ([("A MATCH?! 😱".replace(' 😱',''),(255,255,255))],H-120,140,1,1)])
fr=small(fr,'Top: illustration')
cv2.imwrite('thumbA.png',fr.clip(0,255).astype(np.uint8))
cv2.imwrite('thumbA_small.png',cv2.resize(fr.clip(0,255).astype(np.uint8),(360,640),interpolation=cv2.INTER_AREA))
