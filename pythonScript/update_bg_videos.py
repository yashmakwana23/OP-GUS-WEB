import json
import os

def update_quiz_videos():
    # Path to the quiz data JSON file
    quiz_file_path = 'd:/Yash/PY CD/YouTube Project/my-interactive-quiz/quiz_data.json'

    try:
        # Read the JSON file
        with open(quiz_file_path, 'r') as file:
            quiz_data = json.load(file)

        # Counter for cycling through video files
        video_counter = 1        # Update each scene's backgroundVideoUrl
        if 'scenes' not in quiz_data:
            raise KeyError("No 'scenes' key found in quiz data")
            
        for scene in quiz_data['scenes']:
            if 'props' not in scene:
                continue
                
            # Construct the video file path and update backgroundVideoUrl
            video_path = f"/videos/bg{video_counter}.mp4"
            scene['props']['backgroundVideoUrl'] = video_path
            
            # Increment counter and reset if needed
            video_counter = (video_counter % 14) + 1

        # Write the updated JSON back to file
        with open(quiz_file_path, 'w') as file:
            json.dump(quiz_data, file, indent=2)

        print("Background video URLs have been updated successfully!")
        print(f"Updated {video_counter - 1} scenes with video backgrounds")

    except FileNotFoundError:
        print(f"Error: Could not find the quiz data file at {quiz_file_path}")
    except json.JSONDecodeError:
        print("Error: The quiz data file is not valid JSON")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    update_quiz_videos()