import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";


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

const getPasswordById = async (id: number) : Promise<string> => {
    const conn = await getPool().getConnection();
    const query = 'select password from user where id = ?';
    const [ result ] = await conn.query( query, id);
    conn.release();
    return result[0].password;
}

const getPasswordByEmail = async (email: string) : Promise<User[]> => {
    const conn = await getPool().getConnection();
    const query = 'select id, password from user where email = ?';
    const [ result ] = await conn.query( query, [email] );
    conn.release();
    return result;
}

const getUserIdByToken = async (token: string) : Promise<User> => {
    const conn = await getPool().getConnection();
    const query = 'select id from user where auth_token = ?';
    const [ result ] = await conn.query( query, [token] );
    conn.release();
    if (result.length === 1) {
        return result[0];
    } else {
        return null;
    }
}

const saveToken = async (id: number, token: string) : Promise<void> => {
    const conn = await getPool().getConnection();
    const query = 'update user set auth_token = ? where id = ?';
    conn.query( query, [token, id] );
    conn.release();
}

const updateUser = async (id : number, properties: Partial<Properties>) : Promise<void> => {

    const conn = await getPool().getConnection();

    let query = 'update user set'
    for (const property in properties) {
        if (properties.hasOwnProperty(property)) {
            query += ` ${conn.escapeId(property)} = ${conn.escape(properties[property as keyof typeof properties])}`
        }
    }
    query += ' where id = ?'
    ;
    conn.query(query, id);
    conn.release();
}

const deleteToken = async (id: number) : Promise<void> => {
    await saveToken(id, null);
}



const emailAlreadyRegistered = async (email: string) : Promise<boolean> => {
    const conn = await getPool().getConnection();
    const query = 'select count(*) as count from user where email = ?';
    const [ result ] = await conn.query( query, [email] );

    conn.release();
    return result[0].count !== 0;
}

const getImagePath = async (id: number) : Promise<string> => {
    Logger.info(`Getting image for user ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = `select image_filename from user where id = ?`;
    const [ rows ] = await conn.query(query, id);

    conn.release();
    return (rows.length > 0) ? rows[0].image_filename : null;
}

const setImagePath = async (id: number, filename: string) : Promise<void> => {
    Logger.info(`Setting image for user ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = `update user set image_filename = ? where id = ?`;
    await conn.query(query, [filename, id]);

    conn.release();
}

const deleteImagePath = async (id: number) : Promise<void> => {
    Logger.info(`Deleting image for user ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = `update user set image_filename = null where id = ?`;
    await conn.query(query, id);

    conn.release();
}

export {getOne, insert, getPasswordById, getPasswordByEmail, getUserIdByToken, updateUser, saveToken, deleteToken,
    emailAlreadyRegistered, getImagePath, setImagePath, deleteImagePath}