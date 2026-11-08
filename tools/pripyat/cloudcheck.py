import sys, cv2
im = cv2.imread(sys.argv[1]); h, w = im.shape[:2]
g = im[int(h*.25):int(h*.65), int(w*.2):int(w*.8)]
hsv = cv2.cvtColor(g, cv2.COLOR_BGR2HSV)
print('%.4f' % (((hsv[..., 1] < 40) & (hsv[..., 2] > 200)).mean()))
