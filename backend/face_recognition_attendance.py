import sys
import base64
import cv2
import numpy as np
import face_recognition
import os
import json

def load_known_faces(db_path):
    known_faces = {}
    for filename in os.listdir(db_path):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            reg_no = os.path.splitext(filename)[0]
            image_path = os.path.join(db_path, filename)
            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)
            if encodings:
                known_faces[reg_no] = encodings[0]
    return known_faces

def decode_image(base64_str):
    img_data = base64.b64decode(base64_str.split(',')[1])
    np_arr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

def recognize_face(known_faces, input_image):
    unknown_encodings = face_recognition.face_encodings(input_image)
    if not unknown_encodings:
        return None

    unknown_encoding = unknown_encodings[0]

    for reg_no, known_encoding in known_faces.items():
        results = face_recognition.compare_faces([known_encoding], unknown_encoding, tolerance=0.45)
        if results[0]:
            return reg_no
    return None

if __name__ == "__main__":
    studentId = sys.argv[1]
    base64_image = sys.argv[2]

    image_db_path = "./image_db"
    input_image = decode_image(base64_image)
    known_faces = load_known_faces(image_db_path)
    matched_id = recognize_face(known_faces, input_image)

    if matched_id == studentId:
        response = {"recognized": True, "studentName": studentId}
    else:
        response = {"recognized": False}

    print(json.dumps(response))
