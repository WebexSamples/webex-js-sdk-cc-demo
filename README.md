# Webex Contact Center SDK Beta Demo

This repository contains a sample application demonstrating the use of Webex Contact Center SDK Beta. It showcases how to build a simple agent desktop application with basic call control features.

## Table of Contents

- [Running the Application](#running-the-application)
- [Features and Limitations](#features-and-limitations)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Thanks!](#thanks)

## Running the Application

### NPM Version

1. cd sample-code-npm
2. npm install
3. npm start  
   This will launch Parcel and open `index.html` at `http://localhost:1234`.

### CDN Version

1. cd sample-code-cdn
2. Open this folder in VS Code
3. Click the **Go Live** button (ensure the Live Server extension is installed)
4. Enter your access token and follow the on-screen instructions to initialize the SDK
5. For a clear-cut guide on how to use the sample app, follow the [Sample App Tutorial](https://app.vidcast.io/share/b7c4ee45-9bb9-4a07-bae3-4c10d0239903)

## Features and Limitations

This demo showcases the following features:

- SDK initialization with an access token
- Agent login/logout
- Setting agent state
- Handling incoming calls
- Basic call controls (answer, decline, hold, mute, end)

**Important Limitations:**

- Only basic call control features are fully implemented
- Consult and transfer flows require manual destination entry and may not work as expected in all scenarios
- This is a beta SDK demonstration and some features may change in future releases

## Documentation

For more detailed information:

- Refer to the Webex Contact Center SDK Beta documentation
- See the beta documentation provided with your SDK access for API details and implementation guidelines

## Project Structure

- `sample-code/index.html` - Main HTML file for the application
- `sample-code/app.js` - JavaScript implementation of the agent desktop
- `sample-code/styles.css` - Styling for the application

## Thanks!

We truly appreciate your contribution to the Webex Samples!

Made with <3 by the Webex Developer Relations Team at Cisco
