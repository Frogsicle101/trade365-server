import {Request, Response} from "express";

const loginRequired = async (req: Request, res: Response, next: () => void) => {
    const token = req.header('X-Authorization');

    try {
        const result = await findUserIdByToken(token);
        if (result == null) {
            res.statusMessage = "Unauthorized";
            res.status(401).end();
        } else {
            req.body.authenticatedUserId = result.user_id;
            next();
        }
    } catch (err) {
        res.status(500).send("Error authenticating user")
    }
};

export {loginRequired}