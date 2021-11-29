const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require("jsonwebtoken");

const users = [
    {
        email: "utkarsh@gmail.com", name: "Utkarsh Mehta", id: 1, password: "demoTodo"
    }, {
        email: "demo@gmail.com", name: "Demo", id: 2, password: "demoTodo"
    }, {
        email: "techhut@gmail.com", name: "TechHut", id: 3, password: "demoTodo"
    }
];

const todos = [{
    user: 1,
    id: 1,
    name: "Shopping",
    list: [{
        data: "Fruits", isDone: false
    }, {
        data: "Foil Paper", isDone: true
    }, {
        data: "Brown Bread", isDone: false
    }]   
}, {
    user: 2,
    id: 2, 
    name: "Demo",
    list: [{
        data: "Item1", isDone: false
    }, {
        data: "Item2", isDone: true
    }, {
        data: "Item3", isDone: false
    }]   
}, {
    user: 3,
    id: 3,
    name: "Shopping",
    list: [{
        data: "Tax Returns", isDone: false
    }, {
        data: "TDS", isDone: true
    }, {
        data: "PF Compliance", isDone: false
    }]   
}];

const {
    ExtractJwt,
    Strategy
} = require('passport-jwt');
const passport = require('passport');

app.use(express.json({
    limit: '100mb'
}))

app.use(express.urlencoded({
    extended: false
}))

app.use(cors({
    exposedHeaders: ["Link"]
}));

app.use(passport.initialize({
    session: false
}))

const jwtOptions = {
    secretOrKey: "dwfsdacvreve",
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    passReqToCallback: true
}

passport.serializeUser(function (user, done) {
    done(null, user);
})

passport.deserializeUser(async function (email, done) {
    let user = users.filter(a => a.email === email);
    if(user.length > 0) {
        return done(user[0]);
    } else {
        done();
    }
})

passport.use('jwt', new Strategy(jwtOptions, async (req, jwt_payload, done) => {
    try {
        let user = users.filter(a => a.email === jwt_payload.id)
        
                if (user.length > 0) {
                    req.user = user[0];
                    return done(null, user[0])
                } else {
                    return done(null, false)
                }
    } catch (ex) {
        console.log('[PASSPORT AUTH]', ex);
        return done(null, false);
    }
}));

app.get("/api/todo", passport.authenticate("jwt"), (req, res) => {
    let todo = todos.filter(a => a.user === req.user.id);
    res.status(200).json(todo);
});

app.post("/api/todo", passport.authenticate("jwt"), (req, res) => {
    let todo = req.body;
    if(todo.user && todo.name && todo.list) {
        todo["id"] = todos.length + 1;
        todos.push(todo);
        res.status(200).json(todo);
    }
    else {
        res.status(400).json({
            message: "Invalid Format!"
        });
    }
});

app.put("/api/todo", passport.authenticate("jwt"), (req, res) => {
    let todo = req.body;
    if(todo.user && todo.name && todo.list && todo.id) {
        todos[todo.id - 1] = todo;
        res.status(200).json(todo);
    }
    else {
        res.status(400).json({
            message: "Invalid Format!"
        });
    }
});

app.post("/api/user/login", async (req, res) => {
    let user = users.filter(e => e.email === req.body.email && e.password == req.body.password);
    user = user.length > 0 ? user[0] : undefined;
    if(user){
    const token = jwt.sign(
        {
            id: user.email,
            firstName: user.name,
        },
        "dwfsdacvreve"
    );
    return res.status(200).json({
        message: "OK",
        token: token,
        user: user,
    });
    }else {
        return res.status(404).json({
            message: "User not found!",
        });
    }
});

app.listen(1234, 'localhost')

console.log(`Started on port 1234`);