import bcrypt from "bcrypt";

const saltRounds = 10;

// ------encryption does
export const doEncrypt = async (value) => {
  return await bcrypt.hash(value, saltRounds);
};

// ------decryption does

export const doDecrypt = async (value, hash) => {
  return await bcrypt.compare(value, hash);
};
