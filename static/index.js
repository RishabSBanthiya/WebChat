
document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
//-----------------------------------------------------------------------------------------------------------//

    // Get username from local storage.
    var username = localStorage.getItem('username');

    // Prompts user to enter a username if not already stored
    if (!username) {
        username_modal();


    } else {
        document.querySelector('#welcome').innerHTML = `User:@${username}`;
    }

    if (localStorage.getItem('current_channel')) {
        change_channel(localStorage.getItem('current_channel'));
    }
//-----------------------------------------------------------------------------------------------------------//
    // Calling function create_channel
    document.querySelector('#create_channel').onclick = () => {
        create_channel();
    };
//-----------------------------------------------------------------------------------------------------------//
    // When name repeats show alert
    socket.on('channel_exists', () => {
        document.querySelector('#channel_name_validation').innerHTML = ' Channel name already in use.';
    });
 //-----------------------------------------------------------------------------------------------------------//
    // New channel
    socket.on('channels', channel_name => {
        channel_broadcasted(channel_name);
    });
 //-----------------------------------------------------------------------------------------------------------//
    // Displays a list of all thread names as links
    document.querySelectorAll('.channel_menu').forEach(link => {
        link.onclick = () => {

            // Get and save channel name.
            const channel_name = link.dataset.channel;
            localStorage.setItem('current_channel', channel_name);

            // Change the displayed title and messages.
            change_channel(channel_name);
        };
    });
//-----------------------------------------------------------------------------------------------------------//


    // Send message.
    document.querySelector('#send_message').onclick = () => {
        send_message();
    };


    // When a new message is broadcasted.
    socket.on('new_message', (data) => {
        message_broadcasted(data);
    });

    // When messages are broadcasted.
    socket.on('show_messages', (data) => {
        show_messages(data);
    });
});
//-----------------------------------------------------------------------------------------------------------//
function hide(hidemessage)
{
  const current_channel = localStorage.getItem('current_channel');
  hidemessage.remove()
}
//-----------------------------------------------------------------------------------------------------------//
// Display the channel (title and messages) of the channel that is passed as parameter.
function change_channel(channel_name) {

    // Change the displayed title.
    const channel_title = document.querySelector('#channel_title');
    channel_title.innerHTML = `r/${channel_name}`;

    // Remove old messages.
    document.querySelector('#channel_messages').innerHTML = '';

    // Ask server for messages.
    socket.emit('show_messages', {'channel_name': channel_name});

    // Show input field.
    document.querySelector('#message_input').style.display = "block";
}
//-----------------------------------------------------------------------------------------------------------//
// Show all messages that were sent to a channel.
function show_messages (messages) {

    messages.forEach(message => {

        append_message(message);
    });
}
//-----------------------------------------------------------------------------------------------------------//
// When user clicks the 'create channel' button, validate the channel name and emit the new channel.
function create_channel() {

    // Remove validation message.
    document.querySelector('#channel_name_validation').innerHTML = '';

    // Save channel name.
    const channel_name = document.querySelector('#channel_name').value;

    // Validate channel name.
    if (!channel_name) {
            document.querySelector('#channel_name_validation').innerHTML = ' Enter a channel name.';
    } else if (channel_name.length < 0) {
            document.querySelector('#channel_name_validation').innerHTML = ' Channel name needs to be at least 0 characters.';
    } else {
        // Empty input field.
        document.querySelector('#channel_name').value = '';

        // Save username and time.
        const username = localStorage.getItem('username');
        const timestamp = Date.now();

        // Emit new channel.
        socket.emit('newchannel', {'channel_name': channel_name, 'username': username, 'timestamp': timestamp});
    }
}
//-----------------------------------------------------------------------------------------------------------//
// Add the new channel to the channel list.
function channel_broadcasted(channel_name) {

    // Create new list item.
    var new_channel = document.createElement('li');
    new_channel.setAttribute("class", "nav-item");
    new_channel.innerHTML = `<a class="nav-link channel_menu" data-channel="${channel_name}">#${channel_name}</a>`;

    // Append to channel list.
    var list = document.querySelector('#channel_list');
    list.appendChild(new_channel);
}
//-----------------------------------------------------------------------------------------------------------//
// Send a message in the current channel when user clicks 'send'.
function send_message() {

    // Get message, username and current channel.
    const message = document.querySelector('#message').value;
    const username = localStorage.getItem('username');
    const current_channel = localStorage.getItem('current_channel');
    const timestamp = Date.now();

    // Empty input field.

    if(!message) {
    // Doesn't allow users to send a message without content
    }
    else{
     // Emit new message.
    socket.emit('message', {'message': message, 'current_channel': current_channel, 'username': username, 'timestamp': timestamp});
}}
//-----------------------------------------------------------------------------------------------------------//
// If a new message is sent to the current channel, display the message.
function message_broadcasted(message) {

    if (message["current_channel"] === localStorage.getItem('current_channel')) {

        append_message(message);
    }
}
//-----------------------------------------------------------------------------------------------------------//
// Add a message with timestamp, username and content to the message list.
function append_message(message) {

    // Format the time.
    const time = new Date(message['timestamp']);
    const options = {hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short'};
    const time_formatted = time.toLocaleString('en-GB', options);

    // Create new list item.
    const this_message = document.createElement('li');
    this_message.setAttribute('id',`${message['message']}`);
    this_message.innerHTML = ` @${message['username']} : ${message['message']} ${time_formatted} <button onclick='hide(${message['message']})'>Hide</button>`;

    // Append to channel list.
    var list = document.querySelector('#channel_messages');
    list.appendChild(this_message);
}
//-----------------------------------------------------------------------------------------------------------//

// Pops open a lightbox for the user.
function username_modal() {

    // Prevents closing of modal
    $('#username_modal').modal({backdrop: 'static', keyboard: false, show: true});

    // Get username from user and close modal
    document.querySelector('#username_button').onclick = () => {

        const username = document.querySelector('#username').value;

        // Ensure user has filled in username that is entered
        if (!username) {
            document.querySelector('#username_validation').innerHTML = 'Username is invalid';
        }  else {

            // Username saved locally
            localStorage.setItem('username', username);
            $('#username_modal').modal('hide');
            document.querySelector('#welcome').innerHTML = `Welcome to chatterbox ${username}!`

        }


    };
}