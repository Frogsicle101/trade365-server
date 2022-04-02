import Logger from "../../config/logger";
import {getPool} from "../../config/db";

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

export {getAll}