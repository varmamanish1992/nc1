 var bitcoin = require('bitcoin');

 var Client1 = require('node-rest-client').Client;
 var ServiceCall = new Client1();

var client = new bitcoin.Client({
    host: '127.0.0.1',
    port: 7952,
    user: 'adminpc',
    pass: 'admin15'
});
var LastBlock=0;
var URL = "http://192.168.0.13:3001/JustExplorer.asmx/";
URL ="http://ncrblockchain.com/JustExplorer.asmx/";
 
module.exports = function (app,io) {
    io.on('connection', function (socket) {
        console.log('Connection');
        socket.on('SendBlock', function (data) {
            ServiceCall.get(URL + "Explorer_Block_Detail?PageIndex=0&PageNo=0", function (data, response) {
                socket.emit('ReceiveBlock', JSON.stringify(data));
            });
            client.getInfo(function (err, data) {
             socket.emit('ReceiveInfo', data);
            });
             client.getMiningInfo(function (err, data) {
             socket.emit('ReceiveMiningInfo', data);
            });

        });
        setInterval(function(){
            GetLastInfo();
        },5000)

        function GetLastInfo() {
            client.getInfo(function (err, data) {
                if (data.blocks > LastBlock) {
                    LastBlock = data.blocks;
                    var DataInfo = data;
                    console.log(LastBlock);
                    ServiceCall.get(URL+"Explorer_Block_Update?BlockNo=" + LastBlock, function (data, response) {
                        socket.emit('ReceiveBlock', JSON.stringify(data));
                        socket.emit('ReceiveInfo', DataInfo);
                    });
			 client.getMiningInfo(function (err, data) {
		             socket.emit('ReceiveMiningInfo', data);
		          });

                    
                }
            });
        }


        socket.on('SendBlockNo', function (data) {

            var BlockNo = data.BlockNo;

            console.log(BlockNo);

            ServiceCall.get(URL + "Explorer_Block_Detail_By_BlockNo?BlockNo="+BlockNo, function (data, response) {
                socket.emit('ReceiveBlockNo', JSON.stringify(data));
            });

        });





    });
   

    app.get("/", function (req, res, next) {
        client.getBalance('*', 3, function (err, balance) {
            if (err) console.log(err);
            console.log('Balance: ' + balance);
        });
        res.end("Welcome to MyCoin");
    });

    /*  Fill Block Details */
    app.post("/GetBlock", function (req, res, next) {
        var Merchant = { BlockNo: parseInt(req.body.BlockNo) };
        console.log(Merchant);
        if (typeof Merchant.BlockNo === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "BlockNo Is Required "));
        }
        else {
            client.GetBlockByNumber(Merchant.BlockNo, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { BLOCK: data };
                res.end(JsonExecNonQuery(1, val, "Block Details"));
            });
        }
    });

    /*  Fill Block Transactions Details */
    app.post("/GetBlockTransaction", function (req, res, next) {
        var Merchant = { TranId: req.body.TranId };
        if (typeof Merchant.TranId === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "TxId Is Required "));
        }
        else {
            client.getTransaction(Merchant.TranId, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { BLOCK: data };
                res.end(JsonExecNonQuery(1, val, "Block Transcation Details"));
            });
        }
    });


    /*  Create New Merchant With One Address */
    app.post("/Merchant_Create", function (req, res, next) {
        var Merchant = { Name: req.body.Name };
        if (typeof Merchant.Name === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Merchant Name Is Required "));
        }
        else {
            client.getAccountAddress(Merchant.Name, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { ADDRESS: data };
                res.end(JsonExecNonQuery(1, val, "Create New Merchant"));
            });
        }
    });

    /*  Merchant Current Receiving Address */
    app.post("/Merchant_Current_Receive_Address", function (req, res, next) {
        var Merchant = { Name: req.body.Name };
        if (typeof Merchant.Name === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Merchant Name Is Required "));
        }
        else {
            client.getAccountAddress(Merchant.Name, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { ADDRESS: data };
                res.end(JsonExecNonQuery(1, val, "Merchant Current Receive Address"));
            });
        }
    });

    /*  Create New Address Merchant Wise Without Label */
    app.post("/Merchant_New_Address", function (req, res, next) {
        var Merchant = { Name: req.body.Name };
        if (typeof Merchant.Name === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Merchant Name Is Required "));
        }
        else {
            client.getNewAddress(Merchant.Name, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { ADDRESS: data };
                res.end(JsonExecNonQuery(1, val, "Merchant Wise Address"));
            });
        }
    });

    /*  Get Balance For Merchant Wise Show All Balance If Transaction Is Confirm or Not */
    app.post("/Merchant_Get_Balance", function (req, res, next) {
        var Merchant = { Name: req.body.Name };
        if (typeof Merchant.Name === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Merchant Name Is Required "));
        }
        else {
            client.getBalance(Merchant.Name, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { BALANCE: data };
                res.end(JsonExecNonQuery(1, val, "Merchant Wise Balance"));
            });
        }
    });

    /*  Get Received Balance Merchant Wise Minimum 1 Confirmation */
    app.post("/Get_Received_Balance_By_Merchant", function (req, res, next) {
        var Merchant = { Name: req.body.Name, MinConfirm: req.body.MinConfirm === 'undefined' ? 3 : parseInt(req.body.MinConfirm) };
        if (typeof Merchant.Name === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Merchant Name Is Required "));
        }
        else {
            client.getReceivedByAccount(Merchant.Name, Merchant.MinConfirm, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { BALANCE: data };
                res.end(JsonExecNonQuery(1, val, "All Received Balance By Merchant or Account Minimum 1 Confimation "));
            });
        }
    });

    /*  Get All Balance,Receive Send  */
    app.post("/Get_Balance_All", function (req, res, next) {
        var Merchant = { Name: req.body.Name, MinConfirm: req.body.MinConfirm === 'undefined' ? 3 : parseInt(req.body.MinConfirm) };
        var Param = { BALANCE: 0, RECEIVE: 0, SENT: 0 };
        if (typeof Merchant.Name === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Merchant Name Is Required "));
        }
        else {
            client.getBalance(Merchant.Name, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                else {
                    Param.BALANCE = data;
                    client.getReceivedByAccount(Merchant.Name, Merchant.MinConfirm, function (err, data) {
                        if (err) {
                            console.log(err);
                            res.end(JsonExecNonQuery(0, [], err.message));
                        }
                        else {
                            Param.RECEIVE = data;
                        }
                        var val = { BALANCE_DETAIL: Param };
                        res.end(JsonExecNonQuery(1, val, "All Balance"));
                    });

                }

            });
        }
    });

    /*  Get Received Balance Address Wise Minimum 1 Confirmation*/
    app.post("/Get_Received_Balance_By_Address", function (req, res, next) {
        var Address = { Address: req.body.Address };
        if (typeof Address.Address === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Address Is Required "));
        }
        else {
            client.getReceivedByAddress(Address.Address, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { ADDRESS: data };
                res.end(JsonExecNonQuery(1, val, "All Received Balance By Address Minimum 1 Confimation"));
            });
        }
    });

    /*  All Address List By Pass Merchant Name or Account Name */
    app.post("/Merchant_All_Address", function (req, res, next) {
        var Merchant = { Name: req.body.Name };
        if (typeof Merchant.Name === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Merchant Name Is Required "));
        }
        else {
            client.getAddressesByAccount(Merchant.Name, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { ADDRESS: data };
                res.end(JsonExecNonQuery(1, val, "Merchant All Address"));
            });
        }
    });

    /*  Get Merchant Or Account Name By Pass Address */
    app.post("/Merchant_Name_Address_Wise", function (req, res, next) {
        var MerchantAddress = { Address: req.body.Address };
        if (typeof MerchantAddress.Address === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Address Is Required "));
        }
        else {
            client.getAccount(MerchantAddress.Address, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { MERCHANT_NAME: data };
                res.end(JsonExecNonQuery(1, val, "Merchant name by Address"));
            });
        }
    });

    /*  Get All Account With Amount ,Confirmation ,MerchantName ,txtid Detail minconfirm 1 */
    app.post("/All_Account_With_Confirmation_Amount_Detail", function (req, res, next) {
        var MinConfirm = { MinConfirm: parseInt(req.body.MinConfirm) };

        if (typeof MinConfirm.MinConfirm === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "MinConfirm Param Required"));
        }
        else {
            client.listReceivedByAccount(MinConfirm.MinConfirm, false, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { ADDRESS_LIST: data };
                res.end(JsonExecNonQuery(1, val, "All Account With Amount ,Confirmation ,MerchantName ,LableName Minimum  1 Confirm"));
            });
        }
    });

    /*  Get All Address With Amount ,Confirmation ,MerchantName ,txtid Detail minconfirm 1 */
    app.post("/All_Address_With_Confirmation_Amount_Detail", function (req, res, next) {
        var MinConfirm = { MinConfirm: parseInt(req.body.MinConfirm) };

        if (typeof MinConfirm.MinConfirm === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "MinConfirm Param Required"));
        }
        else {
            client.listReceivedByAddress(MinConfirm.MinConfirm, false, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { ADDRESS_LIST: data };
                res.end(JsonExecNonQuery(1, val, "All Address With Amount ,Confirmation ,MerchantName ,LableName Minimum  1 Confirm"));
            });
        }
    });

    /*  All Merchant Transaction List */
    app.post("/Merchant_List_Transaction", function (req, res, next) {
        var Merchant = { Name: req.body.Name, Count: req.body.Count === 'undefined' ? 10 : parseInt(req.body.Count) };
        if (typeof Merchant.Name === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Merchant Name Is Required "));
        }
        else {
            client.listTransactions(Merchant.Name, Merchant.Count, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { TRANSACTION: data };
                res.end(JsonExecNonQuery(1, val, "All Transaction List By Merchant"));
            });
        }
    });

    /*  Send Transaction */
    app.post("/Transaction_Send", function (req, res, next) {
        console.log('d');
        var Trans = { From: req.body.From, To: req.body.To, Amount: parseFloat(req.body.Amount), Fees: parseFloat(req.body.Fees) };

        if (typeof Trans.From === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "From Merchant Name Is Required "));
        }
        else if (typeof Trans.To === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "To Address Is Required "));
        }
        else if (typeof Trans.Amount === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Amount Is Required "));
        }
        else {
            client.setTxFee(parseFloat(Trans.Fees), function (err, data) {
                if (err) {
                    console.log(JSON.stringify(err));
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                else {
                    client.sendFrom(Trans.From, Trans.To, Trans.Amount, function (err, data) {
                        if (err) {
                            console.log("sendFrom :" + JSON.stringify(err));
                            res.end(JsonExecNonQuery(0, [], err.message));
                        }
                        else {
                            console.log(data);
                            //var val = { TRANSACTION_ID: data };
                            //res.end(JsonExecNonQuery(1, val, "Send Transaction Success"));
                            client.getTransaction(data, function (err, data) {
                                if (err) {
                                    console.log(err);
                                    res.end(JsonExecNonQuery(0, [], err.message));
                                }
                                var val = { TRANSACTION_DETAIL: data };
                                res.end(JsonExecNonQuery(1, val, "Send Transaction Success"));
                            });
                        }

                    });
                }
            });
        }
    });

    /*  Set Fees */
    app.post("/Set_Fees", function (req, res, next) {
        console.log(req.body.Amount);
        var Fees = { Amount: req.body.Amount };

        if (typeof Fees.Amount === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Fees Param Required"));
        }
        else {
            client.setTxFee(parseFloat(Fees.Amount), function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { FEES: data };
                res.end(JsonExecNonQuery(1, val, "Set Transaction Fees : " + Fees.Amount));
            });
        }
    });

    /*  Check Valid Address Or Not */
    app.post("/Validate_Address", function (req, res, next) {
        var AddressValid = { Address: req.body.Address };

        if (typeof AddressValid.Address === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Address Param Required"));
        }
        else {
            client.validateAddress(AddressValid.Address, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                if (data.isvalid) {
                    var val = { VALID: data };
                    res.send(JsonExecNonQuery(1, val, "Valid Address : " + AddressValid.Address));
                }
                else {
                    var val = { VALID: data };
                    res.end(JsonExecNonQuery(0, [], 'Address Not Valid'));
                }
            });
        }
    });

    /*  Send To Address */
    app.post("/Send_To_Address", function (req, res, next) {
        var Merchant = { Address: req.body.Address, Amount: req.body.Amount === 'undefined' ? 0 : parseFloat(req.body.Amount) };
        if (typeof Merchant.Address === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Address Is Required "));
        }
        else {
            client.sendToAddress(Merchant.Address, Merchant.Amount, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { TRANSACTION: data };
                res.end(JsonExecNonQuery(1, val, "Send To Address"));
            });
        }
    });

    /*  Move Amount 1 Account to Other */
    app.post("/Merchant_Move_From_To_Account", function (req, res, next) {
        var Merchant = { Name: req.body.Name, Name_To: req.body.Name_To, Amount: req.body.Amount === 'undefined' ? 0 : parseFloat(req.body.Amount), MinConfirm: req.body.MinConfirm === 'undefined' ? 1 : parseFloat(req.body.MinConfirm) };
        if (typeof Merchant.Name === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "From Name Or Account Is Required "));
        }
        else if (typeof Merchant.Name_To === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "To Name Or Account Is Required "));
        }
        else {
            client.move(Merchant.Name, Merchant.Name_To, Merchant.Amount, Merchant.MinConfirm, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { ACCOUNT_TRANSFER_BALANCE: data };
                res.end(JsonExecNonQuery(1, val, "Send Amount One Account To Other Account Minimum 1 Confirm Transaction Amount "));
            });
        }
    });

    app.post("/getInfo", function (req, res, next) {
        client.getInfo(function (err, data) {
            if (err) {
                console.log(err);
                res.end(JsonExecNonQuery(0, [], err.message));
            }
            var val = { ACCOUNTTRANSFER: data };
            res.end(JsonExecNonQuery(1, val, "getInfo"));
        });

    });

    app.post("/UnSpent_Transaction", function (req, res, next) {
        client.listUnSpent(1, 1, [], function (err, data) {
            if (err) {
                console.log(err);
                res.end(JsonExecNonQuery(0, [], err.message));
            }
            var val = { UNSPENT: data };
            res.end(JsonExecNonQuery(1, val, "Fill UnSpent Transaction"));
        });

    });

    /*  Fill Transaction Detail By Trans Id */
    app.post("/Get_Transaction_By_Trans_Id", function (req, res, next) {
        var Merchant = { TranId: req.body.TranId };
        if (typeof Merchant.TranId === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "Transaction Id Is Required "));
        }
        else {
            client.getTransaction(Merchant.TranId, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                var val = { TRANSACTION_DETAIL: data };
                res.end(JsonExecNonQuery(1, val, "Transaction Detail By TransId"));
            });
        }
    });

    /*  list account with name and balance */
    app.post("/List_All_Accounts", function (req, res, next) {
        var MinConfirm = { MinConfirm: req.body.MinConfirm === 'undefined' ? 1 : parseInt(req.body.MinConfirm) };
        if (typeof MinConfirm.MinConfirm === 'undefined') {
            res.end(JsonExecNonQuery(0, [], "MinConfirm Param Required"));
        }
        else {
            client.listAccounts(MinConfirm.MinConfirm, function (err, data) {
                if (err) {
                    console.log(err);
                    res.end(JsonExecNonQuery(0, [], err.message));
                }
                else {
                    var val = { valid: data };
                    res.end(JsonExecNonQuery(0, [], 'All Account Details With Name and  Balance'));
                }
            });
        }
    });


}
function JsonExecNonQuery(Success, data, msg) {
    var Result = { Success: Success, Result: data, Msg: msg };
    return JSON.stringify(Result);
}
