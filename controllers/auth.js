import { User } from "../models/index.js";
import bcrypt from "bcryptjs";
import { jwt } from "../utils/jwt.js"

function register(req, res){
    const {email, password} = req.body;

    const user = User({
        email: email.toLowerCase()
    });

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    user.password = hashPassword;

    user.save().then((userStorage)=>{       
        res.status(201).send(userStorage);
    }).catch((err)=>{
        console.log(err);
    });    
}

function login(req, res){
    const {email, password} = req.body;
    const emailLowerCase = email.toLowerCase();

    User.findOne({email: emailLowerCase}).then(function(user) { 
        bcrypt.compare(password, user.password, (bcryptError, check) =>{
            if(bcryptError){
                res.status(500).send({msg: "Error del Servidor."});
            } else if(!check){
                res.status(400).send({msg: "Contraseña incorrecta."});
            } else {
                               
                res.status(200).send({
                    access: jwt.createAccessToken(user),
                    refresh: jwt.createRefreshToken(user)
                });
            }
        });
       
      }).catch((err)=>{
        console.log(err);
    });
}

function refreshAccessToken(req, res){
    const { refreshToken } = req.body;
    if(!refreshToken) {
        res.status(400).send({msg: "Token es Requerido."});
    }

    const hasExpired = jwt.hasExpiredToken(refreshToken);
    if (hasExpired){
        res.status(400).send({msg: "Token expirado."});
    } 

    const { user_id } = jwt.decoded(refreshToken);
    User.findById({_id: user_id}).then(function(user) {
        res.status(200).send({
            access: jwt.createAccessToken(user),
            refresh: jwt.createRefreshToken(user)
        });
    }).catch((err)=>{
        console.log(err);
    });
    
}

export const AuthController = {
    register,login,refreshAccessToken
};