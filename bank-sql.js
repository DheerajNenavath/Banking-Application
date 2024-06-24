const express = require('express')
const { createReadStream } = require('fs')
//cosnt createReadStream = require('fs').createReadStream
const bodyParser = require('body-parser')
const cookieParser = require('cookie-Parser')
const { Database } = require('sqlite3').verbose()
const {randomBytes } = require('crypto')


const BALANCES = {alice: 500,bob: 100,charlie: 10000000}
const SESSIONS = {} //seesionId -> username

const db = new Database('db')

db.on('trace', console.log)
db.serialize(() => {
    db.run( 'CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT, balance INT, UNIQUE (username))')
    db.run(' INSERT OR IGNORE INTO users VALUES ("alice", "password", 500),("bob","hunter2", 100), ("charlie", "this-is-a-complex-password-2384932489",10000000) ')
    db.run('CREATE TABLE IF NOT EXISTS logs (logs TEXT)')
})
process.on('SIGINT',() =>{
    db.close(() => process.exit())
})

const app = express()
app.use(bodyParser.urlencoded({ extended: false}))
app.use(cookieParser())

app.get('/', (req,res) => {
    const sessionId = req.cookies.sessionId
    const username = SESSIONS[sessionId]
    const balance = BALANCES[username]
    const source=req.query.source


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
        `)
    }
})

app.post('/login', (req,res) => {
    const { username, password} = req.body

    const query = `SELECT * FROM users WHERE username="${username}" AND password="${password}"`
    db.get(query,(err,row) => {
        if(err || !row){
            res.send('fail!')
            return
        } 

        const sessionId = randomBytes(16).toString('hex')
        SESSIONS[sessionId]=row.username
        res.cookie('sessionId',sessionId,{
            //secure: true,
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        })
        res.redirect('/')        
    })
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

app.listen(8000)