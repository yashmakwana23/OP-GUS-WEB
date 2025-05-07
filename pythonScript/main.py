import os
import sys
from PIL import Image
import math

# --- Configuration ---
# Set the folder containing your original images
INPUT_FOLDER = 'public/images/one_piece_images' 

# Set the folder where cropped images will be saved
OUTPUT_FOLDER = 'pythonScript/out' 

# Set the percentage of height to keep from the top (0.60 = 60%)
KEEP_PERCENTAGE = 0.70 

# List of image file extensions to process (case-insensitive)
ALLOWED_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff', '.webp') 
# --- End Configuration ---


def crop_images_in_folder(input_dir, output_dir, keep_ratio):
    """
    Crops all images in the input directory to keep the top portion 
    defined by keep_ratio and saves them to the output directory.
    """
    # --- Basic Validation ---
    if not os.path.isdir(input_dir):
        print(f"Error: Input folder not found: {input_dir}")
        sys.exit(1) # Exit the script if input folder is invalid

    if keep_ratio <= 0 or keep_ratio >= 1:
         print(f"Error: KEEP_PERCENTAGE must be between 0 and 1 (exclusive). Value provided: {keep_ratio}")
         sys.exit(1)

    # --- Create Output Folder ---
    try:
        os.makedirs(output_dir, exist_ok=True)
        print(f"Input folder:  {os.path.abspath(input_dir)}")
        print(f"Output folder: {os.path.abspath(output_dir)}")
        print(f"Keeping top {keep_ratio*100:.0f}% of height.")
    except OSError as e:
        print(f"Error creating output directory '{output_dir}': {e}")
        sys.exit(1)
        
    # --- Process Images ---
    processed_count = 0
    skipped_count = 0
    error_count = 0

    print("\nStarting image processing...")

    for filename in os.listdir(input_dir):
        input_path = os.path.join(input_dir, filename)
        
        # Check if it's a file and has an allowed extension
        if os.path.isfile(input_path) and filename.lower().endswith(ALLOWED_EXTENSIONS):
            print(f"Processing: {filename}...", end=' ')
            try:
                with Image.open(input_path) as img:
                    width, height = img.size
                    
                    if height <= 0:
                       print(f"Skipped (invalid height: {height})")
                       skipped_count += 1
                       continue

                    # Calculate the new height (integer value needed for cropping)
                    # Keep the top portion
                    new_height = math.floor(height * keep_ratio) 
                    # Use math.floor to ensure we don't exceed original boundary slightly due to float precision

                    if new_height <= 0:
                       print(f"Skipped (cropped height is zero or less)")
                       skipped_count += 1
                       continue
                       
                    # Define the crop box: (left, upper, right, lower)
                    # Coordinates define the area to *keep*
                    # Keep top 60%: upper=0, lower=new_height
                    # Keep full width: left=0, right=width
                    crop_box = (0, 0, width, new_height) 
                    
                    # Perform the crop
                    cropped_img = img.crop(crop_box)
                    
                    # Construct the output path
                    output_path = os.path.join(output_dir, filename)
                    
                    # Save the cropped image, preserving format if possible
                    save_kwargs = {}
                    img_format = img.format # Get original format
                    
                    # Handle transparency issues when saving certain formats (e.g., RGBA to JPEG)
                    if img_format == 'JPEG' and cropped_img.mode == 'RGBA':
                        print("Converting RGBA to RGB for JPEG...", end=' ')
                        cropped_img = cropped_img.convert('RGB')
                        save_kwargs['quality'] = 95 # Good quality for JPEG
                    elif img_format == 'JPEG':
                         save_kwargs['quality'] = 95

                    # Add other format specific options if needed
                    # Example for PNG compression: save_kwargs['compress_level'] = 6 
                        
                    cropped_img.save(output_path, format=img_format, **save_kwargs)
                    print("Done.")
                    processed_count += 1

            except Exception as e:
                print(f"Error processing {filename}: {e}")
                error_count += 1
        elif os.path.isfile(input_path):
            # Optional: Print skipped non-image files
            # print(f"Skipping non-image file: {filename}")
            skipped_count += 1
            
    print("\n--------------------")
    print("Processing Summary:")
    print(f"  Successfully processed: {processed_count}")
    print(f"  Skipped files:        {skipped_count}")
    print(f"  Errors encountered:   {error_count}")
    print("--------------------")


# --- Run the function ---
if __name__ == "__main__":
    # IMPORTANT: Modify INPUT_FOLDER and OUTPUT_FOLDER before running!
    if INPUT_FOLDER == 'path/to/your/image_folder' or OUTPUT_FOLDER == 'path/to/your/cropped_output_folder':
         print("Error: Please update INPUT_FOLDER and OUTPUT_FOLDER paths in the script before running.")
    else:
        crop_images_in_folder(INPUT_FOLDER, OUTPUT_FOLDER, KEEP_PERCENTAGE)