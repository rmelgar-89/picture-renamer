# Conquest Field Photos Application

A mobile-friendly photo renaming tool for field network engineers by Conquest Technologies. This Progressive Web App (PWA) works offline once installed.

## Overview

The Conquest Field Photos Application allows users to upload photos corresponding to a list of custom photo names. Users can enter a list of names, upload multiple photos for each name, and download the renamed photos in a ZIP file. The app is designed to be flexible, allowing users to skip uploading photos for certain names while still generating the ZIP file with a warning about any missing files.

## Features

- **Custom Photo Names Input**: Users can input a list of photo names, one per line.
- **Multiple Photo Uploads**: For each photo name, users can upload multiple photos and dynamically add additional file inputs.
- **Image Previews**: Uploaded photos are displayed as thumbnails for easy preview.
- **ZIP File Generation**: All uploaded photos are renamed according to the provided names and compressed into a downloadable ZIP file.
- **Missing File Warning**: Users are warned about any missing photos (i.e., names without uploaded files) but can still generate the ZIP file with the available photos.
- **Works Offline**: Once installed as a PWA, the app works without an internet connection.
- **Installable**: Can be added to home screen on mobile devices for easy access.

## How to Use

1. **Enter Photo Names**:
   - On the main screen, enter a list of photo names, one per line.
   - Click Next to generate the file upload form.

2. **Upload Photos**:
   - For each photo name, upload one or more photos.
   - To add more photos for a specific name, click the Add Photo button.

3. **Process Files**:
   - Once you've uploaded your photos, click the Process button.
   - If some photo names are missing uploaded files, you will receive a warning, but the ZIP file will still be generated with the available photos.

4. **Download the ZIP File**:
   - The app will generate a ZIP file containing the renamed photos, which you can download.

## Offline Usage

This app can be installed on your device and used without an internet connection:

1. Visit the app in Chrome, Safari, or other PWA-supporting browsers
2. For iOS: Use the "Add to Home Screen" option in the share menu
3. For Android: Look for the "Add to Home Screen" prompt or use the menu option

Once installed, the app will work even when you're offline in the field.

## Example Workflow

1. Enter the following names into the text box:

Photo_A
Photo_B
Photo_C

2. Upload files for "Photo_A" and "Photo_B", but leave "Photo_C" without an uploaded file.

3. Click Process. A warning will appear indicating that no file was uploaded for "Photo_C".

4. A ZIP file will be generated containing the uploaded files, renamed as Photo_A.jpg, Photo_B.jpg, etc.
