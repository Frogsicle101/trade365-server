export class Auction {
    auctionId: number;
    title: string;
    categoryId: number;
    sellerId: number;
    sellerFirstName: number;
    sellerLastName: string;
    reserve: number;
    numBids: number;
    highestBid: number;
    endDate: string;
    description: string;


    constructor(auctionId: number, title: string, categoryId: number, sellerId: number, sellerFirstName: number, sellerLastName: string, reserve: number, numBids: number, highestBid: number, endDate: string, description: string) {
        this.auctionId = auctionId;
        this.title = title;
        this.categoryId = categoryId;
        this.sellerId = sellerId;
        this.sellerFirstName = sellerFirstName;
        this.sellerLastName = sellerLastName;
        this.reserve = reserve;
        this.numBids = numBids;
        this.highestBid = highestBid;
        this.endDate = endDate;
        this.description = description;
    }
}

export type Category = {
    id: number,
    name: string
}

export type Properties = {
    title: string,
    description: string,
    category_id: number,
    end_date: string,
    reserve: number
}
