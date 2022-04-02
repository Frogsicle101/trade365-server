import Logger from "../../config/logger";
import {getPool} from "../../config/db";
import moment from "moment";

const getAll = async (id: number) : Promise<any> => {
    Logger.info(`Getting bids from the database`);
    const conn = await getPool().getConnection();
    const query = `select
    user_id as bidderId,
    amount,
    first_name as firstName,
    last_name as lastName,
    timestamp
    from auction_bid b join user u on b.user_id = u.id
    where b.auction_id = ?
    order by amount desc`;

    const [ rows ] = await conn.query(query, id);
    conn.release();
    return rows;
}

const insert = async (auctionId: number, bidderId: number, amount: number) : Promise<void> => {
    Logger.info(`Inserting new bid into database`);
    const conn = await getPool().getConnection();
    const query = `insert into auction_bid (auction_id, user_id, amount, timestamp) values (?, ?, ?, ?)`;

    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

    await conn.query(query, [auctionId, bidderId, amount, timestamp]);
    conn.release();
}

export {getAll, insert}