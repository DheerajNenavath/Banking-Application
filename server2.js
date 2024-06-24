const express = require('express')
const { createReadStream } = require('fs')
//cosnt createReadStream = require('fs').createReadStream
const bodyParser = require('body-parser')
const cookieParser = require('cookie-Parser')
const COOKIE_SECRET='akjfdhaslkjfbaskjfhasf'

const USERS = {
    alice: 'password',
    bob: 'hunter2'
}
const BALANCES = {alice: 500,bob: 100}

const app = express()
app.use(bodyParser.urlencoded({ extended: false}))
app.use(cookieParser(COOKIE_SECRET))

app.get('/', (req,res) => {
    const username = req.signedCookies.username
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
        res.cookie('username',username, {signed: true})
        res.redirect('/')
    }else{
        res.send('fail!')
    }
})

app.get('/logout', (req,res) => {
    res.clearCookie('username')
    res.redirect('/')
})

app.listen(4000)