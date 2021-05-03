const { v4: uuidv4 } = require("uuid");
const cache = require("./cache");

const getBalance = () => {
  return cache.get("balance");
};

const getTransaction = (id) => {
  const transactions = cache.get("transactions");
  if (!id) {
      return transactions;
  }
  return transactions.find(obj => obj.id === id);
};

const validateTransaction = (transaction) => {
  //validating input object
  if (!transaction["type"]) {
    return "Transaction type missing";
  }

  if (["credit", "debit"].indexOf(transaction["type"]) == -1) {
    return "Invalid transaction type";
  }

  if (transaction.amount == undefined) {
    return "Transaction amount missing";
  }

  if (isNaN(transaction.amount)) {
    return "Transaction amount must be a number";
  }
};

const validateDebitTransaction = (transaction) => {
  const balance = getBalance();
  const debitAmount = parseFloat(transaction.amount);
  return debitAmount <= balance;
};

const setBalance = (amount) => {
  if (amount < 0) {
    throw "Attempt to set negative balance";
  }
  cache.put("balance", amount);
};

const saveTransaction = (transaction) => {
  let transactions = cache.get("transactions");
  const id = uuidv4();
  transactions.push({
    id,
    type: transaction.type,
    amount: parseFloat(transaction.amount),
    effectiveDate: new Date().toISOString(),
  });
  cache.put("transactions", transactions);
};

const doTransaction = (transaction) => {
  const balance = getBalance();
  const amount = parseFloat(transaction.amount);
  if (transaction.type === "credit") {
    setBalance(balance + amount);
  } else if (transaction.type === "debit") {
    setBalance(balance - amount);
  }

  saveTransaction(transaction);
};

module.exports = {
  getBalance,
  getTransaction,
  validateTransaction,
  validateDebitTransaction,
  doTransaction,
};
