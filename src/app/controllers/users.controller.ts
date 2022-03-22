import * as users from '../models/users.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";
import {Result, ValidationError, validationResult} from "express-validator";
import { uid, suid } from 'rand-token';

import {emailAlreadyRegistered, getPasswordForEmail, saveToken} from "../models/users.model";
import * as passwords from "../services/passwords.service";

const read = async (req: Request, res: Response) : Promise<void> =>
{
    Logger.http(`GET single user id: ${req.params.id}`)
    const id = req.params.id;
    try {
        const result = await users.getOne( parseInt(id, 10) );
        if( result.length === 0 ){
            res.status( 404 ).send('User not found');
        } else {
            const user: User = result[0]
            res.status( 200 ).send({
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email
            });
        }
    } catch( err ) {
        res.status( 500 ).send( `ERROR reading user ${id}: ${ err }`
        );
    }
};

const create = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST create a user`)

    try {
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return
        }

        if (!await emailAlreadyRegistered(req.body.email)) {
            const result = await users.insert(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                await passwords.hash(req.body.password)
            );
            res.status(201).send({"userId": result.insertId});
        } else {
            res.statusMessage = "Bad Request: email already in use";
            res.status(400).end();
        }

    } catch (err) {
        res.status(500).send(`ERROR creating user: ${err}`);
    }
};

const login = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST Login user`);
    try {
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return
        }

        const result = await getPasswordForEmail(req.body.email);
        if (result.length === 1) {
            const databaseHash = result[0].password;
            const id = result[0].id;



            if (await passwords.match(req.body.password, databaseHash)) {

                const token = uid(32);
                await users.saveToken(id, token);
                res.status(200).json({
                    "userId": id,
                    "token": token
                })
                return
            }
        }
        res.status(400).send("Username or password incorrect")

    } catch (err) {
        res.status(500).send(`ERROR logging in : ${err}`);
    }
};

const logout = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST Logout user`);
    try {
        const errors: Result<ValidationError> = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return
        }

        const result = await getPasswordForEmail(req.body.email);
        if (result.length === 1) {
            const databaseHash = result[0].password;
            const id = result[0].id;



            if (await passwords.match(req.body.password, databaseHash)) {

                const token = uid(32);
                await users.saveToken(id, token);
                res.status(200).json({
                    "userId": id,
                    "token": token
                })
                return
            }
        }
        res.status(400).send("Username or password incorrect")

    } catch (err) {
        res.status(500).send(`ERROR logging in : ${err}`);
    }
};



export {read, create, login}