from flask import Flask, request, redirect, make_response, render_template_string
import os
import secrets

app = Flask(__name__)
app.secret_key = os.urandom(24)

# User data
USERS = {
    'alice': 'password',
    'bob': 'hunter2'
}
BALANCES = {'alice': 500, 'bob': 100}
SESSIONS = {}  # sessionId -> username


@app.route('/')
def home():
    session_id = request.cookies.get('sessionId')
    username = SESSIONS.get(session_id)
    balance = BALANCES.get(username, 0)
    source = request.args.get('source')

    if username:
        return render_template_string(f"""
            <h1>Hi {username}! Your Balance is ${balance}.</h1>
            <form method='POST' action='/transfer'>
                Send amount: <input name='amount' />
                To user: <input name='to' />
                <input type='submit' value='Send' />
            </form>
            <br>
            <a href='/logout'>Logout</a>
        """)
    else:
        return render_template_string(f"""
            <h1>{'Hi ' + source + ' reader' if source else ''} Login to your bank account:</h1>
            <form method='POST' action='/login'>
                Username: <input name='username' />
                Password: <input name='password' type='password' />
                <input type='submit' value='Login' />
            </form>
        """)


@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = USERS.get(username)

    if request.form['password'] == password:
        session_id = secrets.token_hex(16)
        response = make_response(redirect('/'))
        response.set_cookie('sessionId', session_id, httponly=True, samesite='Lax', max_age=30*24*60*60)
        SESSIONS[session_id] = username
        return response
    else:
        return "Login failed!", 403


@app.route('/logout')
def logout():
    session_id = request.cookies.get('sessionId')
    if session_id in SESSIONS:
        del SESSIONS[session_id]
    
    response = make_response(redirect('/'))
    response.delete_cookie('sessionId')
    return response


@app.route('/transfer', methods=['POST'])
def transfer():
    session_id = request.cookies.get('sessionId')
    username = SESSIONS.get(session_id)

    if not username:
        return "Unauthorized access!", 403

    amount = int(request.form['amount'])
    to_user = request.form['to']

    if to_user not in BALANCES or amount <= 0:
        return "Invalid transaction!", 400

    if BALANCES[username] < amount:
        return "Insufficient funds!", 400

    BALANCES[username] -= amount
    BALANCES[to_user] += amount

    return redirect('/')


if __name__ == '__main__':
    app.run(port=4000, debug=True)
