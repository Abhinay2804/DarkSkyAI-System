import cv2
import numpy as np
import os
import sys

image_path = sys.argv[1]

if not os.path.exists(image_path):
    print("-1")
    exit()

image = cv2.imread(image_path)

if image is None:
    print("-1")
    exit()

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

brightness = np.mean(gray)

pollution_score = round((brightness / 255) * 100, 2)

print(pollution_score)