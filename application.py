import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Dictionary with all channels and messages.
channels = {'All': [{"hey:bye"}]}

@app.route("/")
#Landing page
def index():
    channel_list = list(channels)
    return render_template("index.html", channel_list=channel_list)
#-------------------------------------------------------------------
@socketio.on("newchannel")
def newchannel(data):

    new_channel = data["channel_name"]

    # Check if new channel name doesn't already exist.
    if new_channel in channels:
        emit("channel_exists")
    else:
        # Add channel
        channels[new_channel] = []

        # Emit.
        emit("channels", new_channel, broadcast=True)
#-------------------------------------------------------------------
@socketio.on("message")
def message(data):

    new_message = {}
    new_message["message"] = data["message"]
    new_message["username"] = data["username"]
    new_message["timestamp"] = data["timestamp"]
    current_channel = data["current_channel"]


    # Save new message.
    channels[current_channel].append(new_message)

    # limit list length
    channels[current_channel] = channels[current_channel][-100:]

    emit("new_message", data, broadcast=True)

#-------------------------------------------------------------------
@socketio.on("show_messages")
def show_messages(data):

    # Get stored messages.
    messages = channels[data["channel_name"]]
    emit("show_messages", messages)

#-------------------------------------------------------------------
