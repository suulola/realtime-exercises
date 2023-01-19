const chat = document.getElementById('chat')
const msgs = document.getElementById('msgs')

// let's store all current messages here
let allChat = []

// the interval to poll at in milliseconds
const INTERVAL = 3000

// a submit listener on the form in the HTML
chat.addEventListener('submit', function (e) {
  e.preventDefault()
  postNewMsg(chat.elements.user.value, chat.elements.text.value)
  chat.elements.text.value = ''
})

async function postNewMsg (user, text) {
  try {
    const data = { user, text }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
    const res = await fetch('/poll', options)
    const json = await res.json()
  } catch (error) {
    console.error('post error', error)
  }
}

async function getNewMsgs () {
  let json
  try {
    let response = await fetch('/poll')
    json = await response.json()

    if (res.status >= 400) {
      throw new Error('request did not succeed: ' + res.status)
    }
    allChat = json.chat
    render()
    failedTries = 0
  } catch (error) {
    console.error('polling error', error)
    failedTries++
  }
}

function render () {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  )
  msgs.innerHTML = html.join('\n')
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`

// make the first request
// getNewMsgs()
const BACKOFF = 5000;
let failedTries = 0;
let timeToMakeNextRequest = 0
const refTimer = async time => {
  if (timeToMakeNextRequest <= time) {
    await getNewMsgs()
    timeToMakeNextRequest = time + INTERVAL + (failedTries * BACKOFF)
  }
  requestAnimationFrame(refTimer)
}
requestAnimationFrame(refTimer)
