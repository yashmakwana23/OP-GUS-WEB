import csv
import json
import random

# Define the input and output file paths
input_csv = 'pythonScript/OPChars.csv'  # Your input CSV file path
output_json = 'output.json'  # Output JSON file path

# List of possible background video options
background_videos = [
    "1background.mp4", "1bg.mp4", "2background.mp4", "2bg.mp4", "3background.mp4", "3bg.mp4",
    "4background.mp4", "4bg.mp4", "Sbg.mp4", "bg1.mp4", "bg2.mp4", "bg3.mp4", "bg4.mp4", "multi.mp4"
]

# Read CSV file and process each row
with open(input_csv, mode='r') as file:
    csv_reader = csv.DictReader(file)
    scenes = []

    for row in csv_reader:
        # Create a list of the options
        options = [row['option1'], row['option2'], row['option3']]
        # Add the correct answer (name) to the options list
        correct_answer = row['name']
        options.append(correct_answer)

        # Randomize the order of the options
        random.shuffle(options)

        # Determine the position of the correct answer in the shuffled options
        correct_answer_id = chr(options.index(correct_answer) + 65)  # Convert index to 'A', 'B', 'C', or 'D'

        # Randomize the overlay color
        overlay_color = f"rgba({random.randint(150, 255)}, {random.randint(100, 200)}, {random.randint(200, 255)}, 0.31)"

        # Randomly select a background video
        background_video_url = f"/videos/{random.choice(background_videos)}"

        # Create the JSON structure for this row
        scene = {
            "sceneId": f"q_{row['original name'].replace(' ', '_').lower()}_v2_example",
            "sceneType": "QnA",
            "variant": "PinkGridQuizV2",
            "durationInSeconds": 8,
            "props": {
                "titleText": f"Guess the Character\n Difficulty: {row['Type']}",
                "questionText": None,
                "referenceImageUrl": f"/images/one_piece_images/{row['original name']}.jpg",
                "options": [
                    {"id": "A", "text": options[0]},
                    {"id": "B", "text": options[1]},
                    {"id": "C", "text": options[2]},
                    {"id": "D", "text": options[3]}
                ],
                "correctAnswerId": correct_answer_id,
                "timerDuration": 5,
                "crewImageUrl": "/images/one-piece-crew.png",
                "logoUrl": "/images/anime-logo-placeholder.png",
                "backgroundVideoUrl": background_video_url,
                "backgroundUrl": None,
                "enableOverlay": True,
                "overlayColor": overlay_color
            }
        }

        # Add this scene to the scenes list
        scenes.append(scene)

# Write the output JSON to file
with open(output_json, 'w') as json_file:
    json.dump(scenes, json_file, indent=4)

print(f"JSON file has been created at {output_json}")
