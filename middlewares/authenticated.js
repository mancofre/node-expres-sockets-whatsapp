import { jwt } from '../utils/index.js';

function asureAuth(req, res, next){    
    if(!req.headers.authorization){
        res.status(400).send({msg: "La petición no tiene cabecera de autenticación."});
    }

    const token = req.headers.authorization.replace("Bearer ","");
    try {
        const hasExpired = jwt.hasExpiredToken(token);
        if(hasExpired){
            return res.status(400).send({msg: "Token a expirado"})
        }

        const payload = jwt.decoded(token);
        req.user = payload; 
        next();
    } catch (error) {
        return res.status(400).send({msg: "Token invalido"})
    }



    //next();
}


export const mdAuth = {        
     asureAuth

} 