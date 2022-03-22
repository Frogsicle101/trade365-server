import bcrypt from "bcrypt";
const saltRounds = 10;


const hash = async (password: string) => {
    return await bcrypt.hash(password, saltRounds);
};

const match = async (password: string, databaseHash: string) => {
    return await bcrypt.compare(password, databaseHash);
}

export {hash, match};
