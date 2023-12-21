const express = require('express');
const mysql = require('mysql2');
const { ethers } = require('ethers');
const cors = require('cors');


const bodyParser = require('body-parser'); // Add this line to parse JSON payloads

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


// Replace these values with your actual database connection details
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password$2',
    database: 'WalletNotification'
})
// connect to db
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


// Middleware to parse JSON request bodies
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    // Process the incoming webhook payload here
    //console.log('Webhook payload:', req.body.event.activity);

    let userAddress = req.body.event.activity[0].toAddress;
    let userMessage = `You received ${req.body.event.activity[0].value} ${req.body.event.activity[0].asset} from ${req.body.event.activity[0].fromAddress}`;

    console.log(userAddress);
    console.log(userMessage);

    // Store the data in the database
    const query = 'INSERT INTO notification (userAddress, notification_msg, isRead) VALUES (?,?,?)';
    const values = [userAddress, userMessage, false];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        console.log("stored in DB")
    });

    // Send a response if needed
    res.json({ status: 'Received the webhook payload' });
});


app.get('/notifications', (req, res) => {
    const userAddress = req.query.userAddress;

    console.log(userAddress);
    // Query to fetch notifications for a given userId
    const query = 'SELECT * FROM notification WHERE userAddress = ?';

    connection.query(query, [userAddress], (err, results) => {
        if (err) {
            console.error('Error fetching notifications from MySQL:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        let finalResult = {
            status: true,
            result : results
        }
        console.log(results);
        res.json(finalResult);
    });
});



app.get('/createAccount', async (request, response) => {
    try {
        const wallet = ethers.Wallet.createRandom();

        console.log('address:', wallet.address)
        console.log('mnemonic:', wallet.mnemonic.phrase)
        console.log('privateKey:', wallet.privateKey)

        let newWallet = {
            "message": "Success",
            "Mnemonic": wallet.mnemonic.phrase.toString(),
            "Address": wallet.address.toString(),
            "PrivateKey": wallet.privateKey.toString()
        }

        response.send(newWallet);
    }
    catch {
        result = {
            "message": "error"
        }
        response.send(result)
    }

});

app.post('/mainToken/balance', async (request, response) => {
    try {
        let rpc = request.query.RPC;
        let address = request.query.address;
        console.log(rpc, address);

        EthersBalance = await connectToNetwork(rpc, address);

        let networkDetails = {
            "message": "Success",
            "balance": EthersBalance
        };
        response.send(networkDetails);
    }
    catch {
        result = {
            "message": "error"
        }
        response.send(result)
    }

});

app.post('/account/mnemonic', async (request, response) => {
    try {
        let mnemonic = request.query.Mnemonic;

        result = await generateAccountFromMnemonic(mnemonic);

        response.send(result);
    }
    catch {
        result = {
            "message": "error"
        }
        response.send(result)
    }
});





//Functions

function generateAccountFromMnemonic(mnemonic) {
    try {
        // Create a wallet instance from the provided mnemonic
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);

        // Retrieve the Ethereum address and private key
        const address = wallet.address;
        const privateKey = wallet.privateKey;

        result = {
            "message": "Success",
            "Mnemonic": mnemonic,
            "Address": address,
            "PrivateKey": privateKey
        }

        return result;
    }
    catch {
        result = {
            "message": "failed"
        }
        return result;
    }

}


async function connectToNetwork(url, accountAddress) {
    try {

        const provider = new ethers.providers.JsonRpcProvider(url);

        balance = await provider.getBalance(accountAddress);
        balanceInEthers = await ethers.utils.formatEther(balance);
        console.log(`balance in ethers = ${balanceInEthers}`);

        return balanceInEthers.toString();
    }
    catch {
        result = {
            "message": "failed"
        }
        return result;
    }

}



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
