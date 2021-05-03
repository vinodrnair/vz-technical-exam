var express = require("express");
const {
  getBalance,
  getTransaction,
  validateTransaction,
  validateDebitTransaction,
  doTransaction,
} = require("../src/transactionService");

var router = express.Router();

router.get("/balance", function (req, res, next) {
  const balance = getBalance();
  res.send(200, { balance });
});

router.get("/alltransactions", (req, res, next) => {
  const transactions = getTransaction();
  if (!transactions || !transactions.length) {
    res.send(404, "no transaction found");
  } else {
    res.send(200, { transactions });
  }
});

router.get("/transaction/:id", (req, res, next) => {
  const id = req.params.id;
  const transaction = getTransaction(id);
  if (!transaction) {
    res.send(404, 'No such transaction found');
  } else {
    res.send(200, transaction);
  }
});

router.post("/transaction", (req, res, next) => {
  const transaction = req.body;
  const errorMessage = validateTransaction(transaction);
  if (errorMessage) {
    res.send(400, errorMessage);
    return;
  }

  if (transaction.type == "debit" && !validateDebitTransaction(transaction)) {
    res.send(412, "Transaction declined due to insufficient funds");
    return;
  }

  try {
    doTransaction(transaction);
    res.send(200, "Transaction stored");
  } catch (ex) {
    res.send(500, ex.message);
  }
});

module.exports = router;
