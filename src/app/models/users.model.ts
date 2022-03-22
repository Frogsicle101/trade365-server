import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";
import * as passwords from "../services/passwords.service";



const getOne = async (id: number) : Promise<User[]> => {
    Logger.info(`Getting user ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'select first_name, last_name, email from user where id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
};

const insert = async (firstName: string, lastName: string, email: string, password: string) : Promise<ResultSetHeader> => {
    Logger.info(`Adding user to the database`);
    const conn = await getPool().getConnection();

    const query = 'insert into user (first_name, last_name, email, password) values (?, ?, ?, ?)';
    const [ result ] = await conn.query( query, [firstName, lastName, email, password] );
    conn.release();
    return result;
};

const getPasswordForEmail = async (email: string) : Promise<User[]> => {
    const conn = await getPool().getConnection();
    const query = 'select id, password from user where email = ?';
    const [ result ] = await conn.query( query, [email] );
    conn.release();
    return result;
}

const saveToken = async (id: number, token: string) : Promise<void> => {
    const conn = await getPool().getConnection();
    const query = 'update user set auth_token = ? where id = ?';
    conn.query( query, [token, id] );
    conn.release();
}



const emailAlreadyRegistered = async (email: string) : Promise<boolean> => {
    const conn = await getPool().getConnection();
    const query = 'select count(*) as count from user where email = ?';
    const [ result ] = await conn.query( query, [email] );

    conn.release();
    return result[0].count !== 0;
}

export {getOne, insert, getPasswordForEmail, saveToken, emailAlreadyRegistered}