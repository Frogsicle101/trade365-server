import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import {Auction, Category} from "../../auction_types";


const sortText = (sortBy: string) => {
    if (sortBy === "ALPHABETICAL_ASC") {
        return "a.title";
    } else if (sortBy === "ALPHABETICAL_DESC") {
        return "a.title desc";
    } else if (sortBy === "CLOSING_SOON") {
        return "a.end_date";
    } else if (sortBy === "CLOSING_LAST") {
        return "a.end_date desc";
    } else if (sortBy === "BIDS_ASC") {
        return "highestBid";
    } else if (sortBy === "BIDS_DESC") {
        return "highestBid desc";
    }  else if (sortBy === "RESERVE_ASC") {
        return "a.reserve";
    }  else if (sortBy === "RESERVE_DESC") {
        return "a.reserve desc";
    } else {
        throw Error("Invalid sort value");
    }
}

const getAll = async (startIndex: number, count: number, q: string, categoryIds: number[], sellerId: number, bidderId: number, sortBy: string) : Promise<Auction[]> => {
    Logger.info(`Getting auctions from the database`);
    const conn = await getPool().getConnection();
    let query = `select
        a.id as auctionId,
        title,
        category_id as categoryId,
        seller_id as sellerId,
        first_name as sellerFirstName,
        last_name as sellerLastName,
        reserve,
        count(b.auction_id) as numBids,
        max(amount) as highestBid,
        end_date as endDate
        from auction a join user u on a.seller_id = u.id
        left join auction_bid b on a.id = b.auction_id`;

    const searchCriteria: string[] = [];
    if (q !== null) {
        searchCriteria.push(`a.title like ${conn.escape("%" + q + "%")} or a.description like ${conn.escape("%" + q + "%")}`);
    }
    if (categoryIds !== null) {
        searchCriteria.push(`a.category_id in (${conn.escape(categoryIds)})`);
    }
    if (sellerId !== null) {
        searchCriteria.push(`a.seller_id = ${conn.escape(sellerId)}`);
    }
    if (bidderId !== null) {
        searchCriteria.push(`b.user_id = ${conn.escape(bidderId)}`);
    }

    if (searchCriteria.length > 0) {
        query += " where " + searchCriteria.join(" and ");
    }



    query += `
    group by a.id
    order by ${sortText(sortBy)}`;

    const [ rows ] = await conn.query(query);
    conn.release();
    return rows.slice(startIndex, startIndex + (count !== null ? count: rows.length));
}

const getOne = async (id: number) : Promise<Auction> => {
    Logger.info(`Getting auction ${id} from the database`);
    const conn = await getPool().getConnection();


    const query = `select
        a.id as auctionId,
        title,
        category_id as categoryId,
        seller_id as sellerId,
        first_name as sellerFirstName,
        last_name as sellerLastName,
        reserve,
        count(b.auction_id) as numBids,
        max(amount) as highestBid,
        end_date as endDate,
        description
        from auction a join user u on a.seller_id = u.id
        left join auction_bid b on a.id = b.auction_id
        where a.id = ?
        group by a.id`;

    const [ rows ] = await conn.query(query, id);

    conn.release();
    return rows.length === 1 ? rows[0] : null;
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

export {getAll, getOne, remove, getCategories}