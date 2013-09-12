var socket

var init = function(host) {
    console.log('Setting up Primus connection')
    socket = new Primus(host)
    socket.on('open', function() {
        console.log('We have a connection')
    })
    socket.on('error', function(error) { 
        console.error('error', error)
    })
    socket.on('connect.fail', function(reason) {
        console.log('Connection failed: ' + reason)
    })
    socket.on('disconnect', function() {
        console.log('disconnected')
        socket = null
    })
}

$(document).ready(function() {
    $( "#tabs" ).tabs()
    var host = localStorage.getItem('xmpp-ftw-host') || 'https://xmpp-ftw.jit.su'
    jQuery.getScript(host + '/scripts/primus.js', function() {
        init(host)
    })
})


/* Settings tab */

$('#settings').on('submit', 'form', function(e) {
    e.preventDefault()
    // Save details to localstorage
    var settings = $('#settings form')
    localStorage.setItem('jid', settings.find('input[name=jid]').val())
    localStorage.setItem('password', settings.find('input[name=password]').val())
    localStorage.setItem('host', settings.find('input[name=host]').val())
    localStorage.setItem('xmpp-ftw-host', settings.find('input[name=xmpp-ftw-host]').val())
    console.log('Saved settings')
})