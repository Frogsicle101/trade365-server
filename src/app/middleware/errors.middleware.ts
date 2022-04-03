import {Request, Response} from "express";
import {Result, ValidationError, validationResult} from "express-validator";

const checkErrors = async (req: Request, res: Response, next: () => void) => {
    try {
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            const firstError = errors.array()[0];
            res.statusMessage = "Bad Request: " + firstError.param + " field " + firstError.msg;
            res.status(400).send();
        } else {
            next();
        }

    } catch (err) {
        res.status(500).send("Error checking input")
    }
};

export {checkErrors}