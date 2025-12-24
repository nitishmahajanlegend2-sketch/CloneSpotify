import os
import json

def generate_json():
    # The name of your main music folder
    songs_dir = r"C:\Users\Administrator\Desktop\finalfolderupload\SpotifyClone\songs"
    data = {}
    print(os.path.abspath(__file__))

    # Check if the folder exists
    if not os.path.exists(songs_dir):
        print(f"Error: '{songs_dir}' folder not found! Make sure this script is in the root directory.")
        return

    # Loop through each subfolder (Singer names)
    for folder in os.listdir(songs_dir):
        folder_path = os.path.join(songs_dir, folder)
        
        # We only want to process actual folders (like 'Dhurandhar')
        if os.path.isdir(folder_path):
            # Find all files ending in .mp3
            song_files = [f for f in os.listdir(folder_path) if f.endswith('.mp3')]
            
            # Add to our dictionary: "SingerName": ["song1.mp3", "song2.mp3"]
            if song_files:
                data[folder] = song_files

    # Save the result as songs.json inside the songs folder
    output_path = os.path.join(songs_dir, 'songs.json')
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=4)
    
    print(f"Successfully created {output_path}")
    print("Folders found:", list(data.keys()))

if __name__ == "__main__":
    generate_json()