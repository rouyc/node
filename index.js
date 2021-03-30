const axios = require('axios')
const bodyParser = require('body-parser')
const express = require('express')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const passportJWT = require('passport-jwt')
const cors = require('cors')
const secret = 'tusauraspas'
const urlEncodedParser = bodyParser.urlencoded({extended: false})

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret
}

const jwtStrategy = new JwtStrategy(jwtOptions, async function (payload, next) {
    const users = await axiosRestDBConfig.get("/myuser")
    const user = users.data.find(user => user.email === payload.user)

    if (user) {
        next(null, user)
    } else {
        next(null, false)
    }
})

passport.use("jwt", jwtStrategy)

const app = express()

const restDBConfig = {
    'baseURL': 'https://projetnode-8e57.restdb.io/rest',
    'headers': {
        'Content-Type': 'application/json',
        'cache-Control': 'no-cache',
        'x-apikey': 'fd7f76efe153e36bd00ea6e2d820ecbf87606',
    }
}

const axiosRestDBConfig = axios.create(restDBConfig)

app.use(cors())

app.get('/article/:id', urlEncodedParser, passport.authenticate('jwt', {session: false}), (req, res) => {
    axiosRestDBConfig.get('/article?q={"idArticle":' + req.params.id +'}')
        .then(response => res.json({
            data: response.data,
        }))
        .catch(error => res.json({error}))
})

app.get('/articles', urlEncodedParser, (req, res) => {
    axiosRestDBConfig.get('/article')
        .then(response => res.json({
            data: response.data,
        }))
        .catch(error => res.json({error}))
})

app.post('/add-article', urlEncodedParser, passport.authenticate('jwt', {session: false}), (req, res) => {
    const data = {
        titreArticle: req.body.title,
        contenuArticle: req.body.content,
        author_id: req.body.author_id,
    }
    axiosRestDBConfig.post('/article', data)
        .then(response => res.json({
            data: response.data,
        }))
        .catch(error => res.json({error}))
})

app.delete('/delete-article/:id', urlEncodedParser, passport.authenticate('jwt', {session: false}), (req, res) => {
    axiosRestDBConfig.delete('/article/*?q={"idArticle":' + req.params.id +'}')
        .then(response => res.json({
            data: response.data,
        }))
        .catch(error => res.json({error}))
})

//A refaire
app.put('/put-article/:id', urlEncodedParser, (req, res) => {
    const data = {
        titreArticle: req.body.title,
        contenuArticle: req.body.content,
    }
    axiosRestDBConfig.put('/article/*?q={"idArticle":' + req.params.id +'}', data)
        .then(response => res.json({
            data: response.data,
        }))
        .catch(error => res.json({error}))
})

app.post('/register', urlEncodedParser, (req, res) => {
    const data = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        password: req.body.password
    }
    axiosRestDBConfig.post('/myuser', data)
        .then(response => res.json({
            data: response.data,
        }))
        .catch(error => res.json({error}))
})

app.post('/login', urlEncodedParser, async function (req, res) {
    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
        res.status(401).json({ error: 'Email or password was not provided.' })
        return
    }

    const users = await axiosRestDBConfig.get("/myuser")
    const user = users.data.find(user => user.email === email)

    if (!user || user.password !== password) {
        res.status(401).json({ error: 'Email / password do not match.' })
        return
    }

    const userJwt = jwt.sign({ user: user.email }, secret)

    res.json({
        jwt: userJwt,
        id : user.id,
        username : user.nom,
    })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log('App running on port ' + PORT)
})
