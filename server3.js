const express = require('express')
const { createReadStream } = require('fs')
//cosnt createReadStream = require('fs').createReadStream
const bodyParser = require('body-parser')
const cookieParser = require('cookie-Parser')
const {randomBytes } = require('crypto')

const USERS = {
    alice: 'password',
    bob: 'hunter2'
}
const BALANCES = {alice: 500,bob: 100}
const SESSIONS = {} //seesionId -> username

const app = express()
app.use(bodyParser.urlencoded({ extended: false}))
app.use(cookieParser())

app.get('/', (req,res) => {
    const sessionId = req.cookies.sessionId
    const username = SESSIONS[sessionId]
    const balance = BALANCES[username]
    if(username){
        res.send(`HI ${username}!. Your Balance is $${balance}.` )
    }else{
    createReadStream('index.html').pipe(res)
    }
})

app.post('/login', (req,res) => {
    const username = req.body.username
    const password = USERS[username]

    if(req.body.password === password) {
        const nextsessionId = randomBytes(16).toString('hex')
        res.cookie('sessionId',nextsessionId)
        SESSIONS[nextsessionId]=username
        res.redirect('/')
    }else{
        res.send('fail!')
    }
})

app.get('/logout', (req,res) => {
    const sessionId = req.cookies.sessionId
    delete SESSIONS[sessionId]
    res.clearCookie('sessionId')
    res.redirect('/')
})

app.listen(4000)