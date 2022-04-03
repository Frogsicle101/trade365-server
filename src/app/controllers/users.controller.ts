import * as users from '../models/users.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";
import {uid} from 'rand-token';

import * as passwords from "../services/passwords.service";
import {getUserIdByToken} from "../models/users.model";

const read = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`GET single user id: ${req.params.id}`)
    const id = req.params.id;

    try {
        const numId = parseInt(req.params.id, 10);
        const token = req.header('X-Authorization');
        const authId = (await getUserIdByToken(token)).id;

        const user = await users.getOne(numId);
        if(user === null){
            res.status( 404 ).send('User not found');
        } else {
            if (authId === numId) {
                res.status( 200 ).send({
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email
                });
            } else {
                res.status( 200 ).send({
                    firstName: user.first_name,
                    lastName: user.last_name,
                });
            }

        }
    } catch( err ) {
        res.status( 500 ).send( `ERROR reading user ${id}: ${ err }`
        );
    }
};

const create = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`POST create a user`)

    try {
        if (!await users.emailAlreadyRegistered(req.body.email)) {
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
        const result = await users.getPasswordByEmail(req.body.email);
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

        await users.deleteToken(req.body.authenticatedUserId);
        res.status(200).send();


    } catch (err) {
        res.status(500).send(`ERROR logging out : ${err}`);
    }
};

const update = async (req: Request, res:Response) : Promise<void> => {
    Logger.http(`PATCH update id: ${req.params.id}`);
    try {
        const id = parseInt(req.params.id, 10)
        if (id !== req.body.authenticatedUserId) {
            res.status(403).send()
        } else {
            const user = await users.getOne(id);
            if(user === null) {
                res.status( 404 ).send('User not found');
            } else {

                const properties: Partial<Properties> = {};

                if (req.body.hasOwnProperty("firstName")) {
                    properties.first_name = req.body.firstName;
                }
                if (req.body.hasOwnProperty("lastName")) {
                    properties.last_name = req.body.lastName;
                }
                if (req.body.hasOwnProperty("email")) {
                    properties.email = req.body.email;
                }
                if (req.body.hasOwnProperty("password")) {
                    const hash = await users.getPasswordById(id);
                    if (req.body.hasOwnProperty("currentPassword") && await passwords.match(req.body.currentPassword, hash)) {
                        properties.password = req.body.password;
                    } else {
                        res.statusMessage += ": Incorrect Password";
                        res.status(400).send();
                        return
                    }

                }

                await users.updateUser(id, properties);
                res.status(200).send();
            }
        }

    } catch (err) {
        res.status(500).send(`ERROR logging out : ${err}`);
    }
};

export {read, create, login, logout, update}