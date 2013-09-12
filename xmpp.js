$(document).ready(function() {

var socket

var init = function(host) {
    console.log('Setting up websocket connection')
    socket = new Primus(host)
    socket.on('open', function() {
        setConnectionStatus('connected')
        registerErrorEvents()
    })
    socket.on('error', function(error) { 
        console.error('error', error)
    })
    socket.on('connect.fail', function(reason) {
        console.log('Connection failed: ' + reason)
    })
    socket.on('disconnect', function() {
        console.log('disconnected')
        setConnectionStatus('disconnected')
        socket = null
    })
}

var registerErrorEvents = function() {
    socket.on('xmpp.error', function(error) {
        console.error('xmpp.error', error)
        if (-1 !== error.description.indexOf('XMPP authentication failure'))
            return setConnectionStatus('authentication-fail')
        
    })
}

/* Settings tab */

$('div#tabs li[aria-controls=settings]').on('click', function(e) {
    console.log('populate settings')
    populateSettings()
})

$('#settings form').on('submit', function(e) {
    e.preventDefault()
    e.stopPropagation()
    saveSettings()
})

$('#settings button').on('click', function(e) {
    e.preventDefault()
    e.stopPropagation()
    saveSettings()
})

var saveSettings = function() {
    // Save details to localstorage
    var settings = $('#settings form')
    localStorage.setItem('jid', settings.find('input[name=jid]').val())
    localStorage.setItem('password', settings.find('input[name=password]').val())
    localStorage.setItem('host', settings.find('input[name=host]').val())
    localStorage.setItem(
        'resource',
        settings.find('input[name=resource]').val() ||
            'https://xmpp-ftw.jit.su'
    )
    console.log('Saved settings')
    settings.find('button')
        .toggleClass('success', 200)
        .toggleClass('success', 3000)
}

var populateSettings = function() {
    var settings = $('#settings form')
    settings.find('input[name=jid]').val(localStorage.getItem('jid'))
    settings.find('input[name=password]').val(localStorage.getItem('password'))
    settings.find('input[name=host]').val(localStorage.getItem('host'))
settings.find('input[name=resource]').val(
        localStorage.getItem('resource') || 'xmpp-chrome'
    )
}

/* Home tab */

var oldConnectionStatus
var setConnectionStatus = function(status) {
    var element = $('#home p.connection-status')
    if (!oldConnectionStatus) 
        oldConnectionStatus = status
    else
        element.removeClass(oldConnectionStatus)
    element.addClass(status)
    oldConnectionStatus = status
    var text = status.charAt(0).toUpperCase() +
        status.slice(1).toLowerCase()
    element.html(text.replace('-', ' '))    
}

$('#home').on('click', 'button.login', function(e) {
    var jid, password, host
    
    if (!(jid = localStorage.getItem('jid'))
        || !(password = localStorage.getItem('password'))) {
        console.error('Missing jid &/or password')
        return    
    }
    var payload = {
      jid: jid, password: password
    }
    if (!!(host = localStorage.getItem('host')))
        payload.host = host
    socket.on('xmpp.connection', function(data) {
        if ('online' == data)
            return setConnectionStatus('online')
    })
    socket.emit('xmpp.login', payload)
})

var tabLoaded = function(event, ui) {
    if ('Settings' == ui.newTab[0].innerText)
        return populateSettings()
}

/* Start up */

$('#tabs').tabs({
    activate: tabLoaded
})
var host = 'https://xmpp-ftw.jit.su'
setConnectionStatus('offline')
jQuery.getScript(host + '/scripts/primus.js', function() {
    init(host)
})

})

setTimeout(function() { console.log('something') }, 60000)