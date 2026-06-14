from flask import Flask, request, jsonify
import cv2
import numpy as np

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():

    file = request.files["image"]

    image_bytes = np.frombuffer(
        file.read(),
        np.uint8
    )

    image = cv2.imdecode(
        image_bytes,
        cv2.IMREAD_COLOR
    )

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    brightness = np.mean(gray)

    pollution_score = round(
        (brightness / 255) * 100,
        2
    )

    return jsonify({
        "pollutionScore":
        pollution_score
    })

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001
    )