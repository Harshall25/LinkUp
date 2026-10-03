const jwt = require('jsonwebtoken');
const JWT_KEY = process.env.JWT_SECRET || "Key";
const TOKEN_TTL = '30d';

const signToken = (userId) => jwt.sign({ id: userId.toString() }, JWT_KEY, { expiresIn: TOKEN_TTL });

function userAuth(req,res,next){
    const token = req.headers.token;
    if(!token){
        return res.status(401).json({
            error :  'token not provided'
        })
    }

    try {
        const decodedinformation = jwt.verify(token,JWT_KEY);
        //insert userId in req
        req.userId = decodedinformation.id;
        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }
}

// Attaches req.userId when a valid token is present, but never rejects.
function optionalAuth(req, res, next) {
    const token = req.headers.token;
    if (token) {
        try {
            req.userId = jwt.verify(token, JWT_KEY).id;
        } catch {
            // Treat an invalid token as anonymous on public routes.
        }
    }
    next();
}

module.exports ={
    userAuth,
    optionalAuth,
    signToken,
    JWT_KEY
}
