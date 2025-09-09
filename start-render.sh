#!/usr/bin/env sh

# This script is for running SillyTavern on Render.com

# Set the build command on Render to: npm install
# Set the start command on Render to: ./start-render.sh

# The --listen flag makes it listen on 0.0.0.0, which is what Render needs.
# The --port $PORT uses the environment variable provided by Render.
# The --dataRoot points to the persistent disk mount path. Make sure this path matches the Mount Path you set for your disk on Render.
node server.js --port $PORT --listen --dataRoot /data/st-data