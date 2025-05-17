import base64

# Path to the test image
image_path = "image_db/21BIT101.jpg"  # ← Replace with any image

# Read image and convert to base64
with open(image_path, "rb") as img_file:
    base64_str = base64.b64encode(img_file.read()).decode("utf-8")
    mime_prefix = "data:image/jpeg;base64,"
    full_data_url = mime_prefix + base64_str

    print("----- COPY THIS BELOW INTO POSTMAN OR POWERFUL API TEST -----")
    print(full_data_url)
