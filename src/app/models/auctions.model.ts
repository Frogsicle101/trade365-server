import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import {Auction, Category} from "../../auction_types";


const getOne = async (id: number) : Promise<Auction> => {
    Logger.info(`Getting auction ${id} from the database`);
    const conn = await getPool().getConnection();

    const query = 'select ' +
        'a.id as auctionId, ' +
        'title, ' +
        'category_id as categoryId, ' +
        'seller_id as sellerId, ' +
        'first_name as sellerFirstName, ' +
        'last_name as sellerLastName, ' +
        'reserve, ' +
        'end_date as endDate, ' +
        'description ' +
        'from auction a join user u on a.seller_id = u.id ' +
        'where a.id = ?';
    const [ rows ] = await conn.query(query, id);
    let auction: Auction;
    if (rows.length === 0) {
        auction = null;
    } else {
        const mainResult = rows[0];
        const bidsQuery = 'select ' +
            'count(*) as numBids, max(amount) as highestBid ' +
            'from auction_bid ' +
            'where auction_id = ?'
        const [bidsResult] = (await conn.query(bidsQuery, mainResult.auctionId))[0];

        auction = new Auction(
            mainResult.auctionId,
            mainResult.title,
            mainResult.categoryId,
            mainResult.sellerId,
            mainResult.sellerFirstName,
            mainResult.sellerLastName,
            mainResult.reserve,
            bidsResult.numBids,
            bidsResult.highestBid,
            mainResult.endDate,
            mainResult.description
        );

    }


    conn.release();
    return auction;
};

const remove = async (id: number) : Promise<void> => {
    Logger.info(`Deleting auction ${id} from the database`);
    const conn = await getPool().getConnection();
    const query = 'delete from auction where id = ?';
    await conn.query(query, id);
    conn.release();

}

const getCategories = async () : Promise<Category[]> => {
    Logger.info(`Getting categories from the database`);
    const conn = await getPool().getConnection();

    const query = 'select * from category'
    const [ rows ] = await conn.query(query);
    conn.release();
    return rows;
};

export {getOne, remove, getCategories}