const axios = require('axios')
const bodyParser = require('body-parser')
const express = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const passportJWT = require('passport-jwt')
const secret = 'tusauraspas'
const urlEncodedParser = bodyParser.urlencoded({extended: false})

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret
}

const jwtStrategy = new JwtStrategy(jwtOptions, async function (payload, next) {
    const users = await getUsers()
    const user = users.data.find(user => user.email === payload.user)
    if (user) {
        next(null, user)
    } else {
        next(null, false)
    }
})


passport.use("jwt", jwtStrategy)

const app = express()


app.get('/article/:id', urlEncodedParser, passport.authenticate('jwt', {session: false}), async function (req, res) {
    axios({
        method: 'GET',
        url: 'https://projetnode-8e57.restdb.io/rest/article/' + req.params.id,
        headers:
            {
                'cache-control': 'no-cache',
                'x-apikey': 'fd7f76efe153e36bd00ea6e2d820ecbf87606'
            }
    })
        .catch(function (error) {
            res.send(error)
        })
        .then(function (response) {
            res.send({
                code: 200,
                error: false,
                data: response.data,
                msg: "Get Article"
            });
        })
});

app.get('/articles', urlEncodedParser, passport.authenticate('jwt', {session: false}), async function (req, res) {
    axios({
        method: 'GET',
        url: 'https://projetnode-8e57.restdb.io/rest/article',
        headers:
            {
                'cache-control': 'no-cache',
                'x-apikey': 'fd7f76efe153e36bd00ea6e2d820ecbf87606'
            }
    })
        .catch(function (error) {
            res.send(error)
        })
        .then(function (response) {
            res.send({
                code: 200,
                error: false,
                data: response.data,
                msg : "Get Articles"
            });
        })
});

app.post('/article', urlEncodedParser, passport.authenticate('jwt', {session: false}), async function (req, res) {
    axios({
        method: 'POST',
        url: 'https://projetnode-8e57.restdb.io/rest/article',
        headers:
            {
                'cache-control': 'no-cache',
                'x-apikey': 'fd7f76efe153e36bd00ea6e2d820ecbf87606',
                'content-type': 'application/json'
            },
        data: {
            titreArticle : req.body.title,
            contenuArticle : req.body.content
        }
    })
        .catch(function (error) {
            res.send(error)
        })
        .then(function (response) {
            res.send({
                code: 200,
                error: false,
                data: response.data,
                msg: "Article Post",
            });
        })
});

app.delete('/article/:id', urlEncodedParser, passport.authenticate('jwt', {session: false}), async function (req, res) {
    axios({
        method: 'DELETE',
        url: 'https://projetnode-8e57.restdb.io/rest/article/' + req.params.id,
        headers:
            {
                'cache-control': 'no-cache',
                'x-apikey': 'fd7f76efe153e36bd00ea6e2d820ecbf87606',
                'content-type': 'application/json'
            }
    })
        .catch(function (error) {
            res.send(error)
        })
        .then(function (response) {
            // handle success
            res.send({
                code: 200,
                error: false,
                data: response.data,
                msg: "Article Delete"
            });
        })
});

app.put('/article/:id', urlEncodedParser, passport.authenticate('jwt', {session: false}), async function (req, res) {
    axios({
        method: 'PUT',
        url: 'https://projetnode-8e57.restdb.io/rest/article/' + req.params.id,
        headers:
            {
                'cache-control': 'no-cache',
                'x-apikey': 'fd7f76efe153e36bd00ea6e2d820ecbf87606',
                'content-type': 'application/json'
            },
        data: {
            titleArticle: req.body.title,
            contentArticle: req.body.content
        },
    })
        .catch(function (error) {
            res.send(error)
        })
        .then(function (response) {
            res.send({
                code: 200,
                error: false,
                data: response.data,
                msg: "Article Put"
            });
        })
});

app.post('/register', urlEncodedParser, async function (req, res) {
    axios({
        method: 'POST',
        url: 'https://projetnode-8e57.restdb.io/rest/myuser',
        data: {
            email: req.body.email,
            password: req.body.password
        },
        headers: {
            'cache-control': 'no-cache',
            'x-apikey': 'fd7f76efe153e36bd00ea6e2d820ecbf87606',
            'content-type': 'application/json'
        }
    })
        .catch(function (error) {
            res.send(error)
        })
        .then(function (response) {
            res.send({
                code: 200,
                error: false
            });
        })
});

app.post('/login', urlEncodedParser, async function (req, res) {
    const email = req.body.email
    const password = req.body.password
    const users = await getUsers()

    if (!email || !password) {
        res.status(401).json({error: 'Email or password was not provided'})
        return
    }

    const user = users.data.find(
        (user) => user.email === email && user.password === password
    )

    if (!user) {
        res.status(401).json({error: 'Email / password do not match'})
        return
    }

    const userJwt = jwt.sign({user: user.email}, secret)

    res.json({jwt: userJwt})
})

app.listen(3000, () => {
    console.log('app running on port 3000')
})

async function getUsers() {
    const url = 'https://projetnode-8e57.restdb.io/rest/myuser'
    const config = {
        headers: {
            'x-apikey': 'fd7f76efe153e36bd00ea6e2d820ecbf87606'
        }
    }
    return axios.get(url, config)

}