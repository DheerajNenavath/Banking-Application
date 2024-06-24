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
    const source= htmpEscape(req.query.source)


    if(username){
        res.send(`
        HI ${username}!. Your Balance is $${balance}.
        <form method = 'Post' action='/transfer'>
        Send amount:
        <input name='amount' />
        To user;
        <input name='to' />
        <input type='submit' value='Send' />
        </form> 
        <script>if (window.top.location != window.location) window.top.location = window.location</script>
        ` )
    }else{
        res.send(`
            <h1>
            ${source ? `Hi ${source} reader` :''}
              Login to your bank account:
            </h1>
            <form method='POST' action='/login'>
                Username: <input name='username' />
                Password: <input name='password' type='password' />
                <input type='submit' value='Login' />
            </form> 
            <script>if (window.top.location != window.location) window.top.location = window.location</script>

        `)
    }
})

app.post('/login', (req,res) => {
    const username = req.body.username
    const password = USERS[username]

    if(req.body.password === password) {
        const sessionId = randomBytes(16).toString('hex')
        res.cookie('sessionId',sessionId,{
            //secure: true,
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        })
        SESSIONS[sessionId]=username
        res.redirect('/')
    }else{
        res.send('fail!')
    }
})

app.get('/logout', (req,res) => {
    const sessionId = req.cookies.sessionId
    delete SESSIONS[sessionId]
    res.clearCookie('sessionId',{
        //secure: true,
        httpOnly: true,
        sameSite: 'lax'
    })
    res.redirect('/')
})

app.post('/transfer', (req,res) => {
    const sessionId=req.cookies.sessionId
    const username=SESSIONS[sessionId]

    if(!username){
        res.send('fail!')
        return
    }

    const amount=Number(req.body.amount)
    const to=req.body.to

    BALANCES[username] -= amount
    BALANCES[to] += amount

    res.redirect('/')
})

app.listen(4000)