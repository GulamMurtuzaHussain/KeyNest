/*
dotenv is an npm package used to load environment variables from a .env file into process.env. It is commonly used to keep sensitive information like database credentials, JWT secrets, and API keys outside the source code



*/

import dotenv from 'dotenv';

dotenv.config();
// Tells dotenv: "Read the .env file and load its variables into process.env."
console.log(process.env.JWT_SECRET);

import express from 'express'
import mongoose from 'mongoose'
import { usersModel } from './models/users-model.js'
import { passwordsModel } from './models/pass-model.js'

import cors from 'cors';

/*

You can also allow only your frontend:

app.use(cors({
    origin: "http://localhost:5173"
}));

🎯 Interview answer

"CORS stands for Cross-Origin Resource Sharing. It is a browser security mechanism that controls whether a frontend from one origin can access resources from a backend on another origin. In Express, we commonly use the cors middleware to allow specific origins to access our API."
 
*/

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieparser from 'cookie-parser';
import crypto from 'crypto';

const app = express();
const port = 3000;

const algo = "aes-256-cbc";
/*
What is AES-256-CBC?

AES → Advanced Encryption Standard
256 → key size is 256 bits (32 bytes)
CBC → Cipher Block Chaining, an AES mode of operation.
*/
const key = crypto.scryptSync(process.env.JWT_SECRET, "salt", 32);
/*
scryptSync() → derives a cryptographic key from a password/secret.
process.env.JWT_SECRET → the input secret.
"salt" → salt used during key derivation.
32 → generates a 32-byte (256-bit) key.
That 32-byte key can be used for AES-256 encryption.

Interview line:
“scryptSync() derives a secure 256-bit encryption key from the secret using a salt, which can then be used with AES-256.”

🔑 What is a key?
A key is a secret piece of data used by the encryption algorithm to encrypt/decrypt data.
Without the correct key, the ciphertext should be practically impossible to decrypt.
In your code, the key is generated from JWT_SECRET using scrypt.

🧂 Why "salt"?
Salt is an extra value added to the key-generation process.
It makes key derivation harder to attack and prevents identical inputs from always producing identical derived keys.
For real security, the salt should generally be random and unique, not a hard-coded "salt".

🔢 What is 32?
scryptSync(secret, salt, 32)

32 means:
Generate a key that is 32 bytes long.
32 bytes × 8 = 256 bits.
That's why it's used with AES-256.

Why exactly 32?
Because AES-256 requires a 256-bit key = 32 bytes.

AES supports:
AES-128 → 16 bytes
AES-192 → 24 bytes
AES-256 → 32 bytes
So if you're using AES-256, you need 32 bytes.

Interview line:
“The key is the secret value used by encryption and decryption. 32 generates a 256-bit key, which is required by AES-256, while the salt adds randomness and security during key derivation.”
*/


const db = await mongoose.connect("mongodb://127.0.0.1:27017/passwords-DB");
console.log("db connected");


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json())

app.use(cookieparser())

app.get('/', (req, res) => {
    console.log("welcome");
    res.send('ok');
})

console.log("Before route");


// let user = await usersModel.findOne({username: "gulam_murtuza_hussain"});
// console.log("USER: ", user);

app.post("/find_user", async (req, res) => {

    // const {username} = req.body;

    console.log("Route hit,user: ", req.body.username);

    let find = await usersModel.findOne({ username: req.body.username });
    if (!find) return res.status(404).json({ message: "USER NOT FOUND" });

    const matchPasswords = await bcrypt.compare(req.body.password, find.password);


    console.log("PASSWORD: ", find, req.body.password);


    if (find && !matchPasswords) return res.status(401).json({ message: "PASSWORD WRONG" });
    else {

        /*
            JWT is a compact, secure way of transmitting information between two parties, commonly used for authentication and authorization in web applications.

                        JWT — Working
            Login: User sends email/username and password to the server.
            Verification: Server checks whether the credentials are correct.
            Token Generation: If correct, server generates a JWT containing user information and signs it using a secret key.
            Token Sent: Server sends the JWT back to the client.
            Future Requests: Client sends the JWT with subsequent requests.
            Verification: Server verifies the JWT's signature and checks whether it is valid/expired.
            Access: If valid, the server allows the user to access protected resources; otherwise, it rejects the request.

            Key Points
            JWT = JSON Web Token
            Used for authentication and authorization.
            It has Header, Payload, and Signature.
            JWT is stateless; the server doesn't need to store session information.
            JWT is signed, not encrypted by default.
            Commonly used in REST APIs and web applications.
        */

        /*
            🍪 Cookie — Definition

                A cookie is a small piece of data stored by the browser that a website can use to remember information about the user, such as authentication tokens, preferences, or session information.

            
        */

        const token = jwt.sign( //Creates a JWT token.
            { id: find._id }, //This is the payload of the JWT. Here, the user's ID is stored in the token.
            // supersecretkey
            process.env.JWT_SECRET, //This is the secret key used to sign the JWT. It is kept in the .env file instead of directly in the code.
            { expiresIn: "15m" } //The JWT will expire after 15 minutes.
        )

        /*
            Sends a cookie to the browser.

            "token" → cookie name
            token → JWT stored inside the cookie

            So essentially:

            Cookie named token contains the JWT.

        */

        /*
        1. httpOnly: true → Protects against JavaScript accessing the cookie

        Example:
        Suppose an attacker manages to inject malicious JavaScript into your website through an XSS attack.
        Without httpOnly, that JavaScript could try to read the JWT cookie using document.cookie and steal the token.
        With:
        httpOnly: true
        JavaScript cannot read that cookie.
        👉 Benefit: Helps protect authentication cookies from being stolen through JavaScript/XSS.

        2. secure: true → Protects cookie during transmission

        Example:
        Imagine you're using your website over an insecure HTTP connection. Someone on the network could potentially intercept the cookie.
        With:
        secure: true
        the browser sends the cookie only over HTTPS.
        👉 Benefit: Helps prevent the cookie from being intercepted over an insecure connection.

        3. sameSite: "Strict" → Helps prevent CSRF

        Example:
        You're logged into bank.com.
        An attacker creates another website, evil.com, that tries to make a request to bank.com.
        With:
        sameSite: "Strict"
        the browser generally doesn't send your bank.com cookie with that cross-site request.
        So the attacker can't easily use your authenticated cookie to perform actions on your behalf.
        👉 Benefit: Helps protect against CSRF (Cross-Site Request Forgery).

        🧠 Super easy interview memory
        Option	        Main benefit
        httpOnly	🛡️ JavaScript can't access cookie → XSS protection
        secure	🔒 Cookie only over HTTPS → network protection
        sameSite	🚫 Restricts cross-site cookies → CSRF protection
        */

        res.cookie("token", token, {
            httpOnly: true, //JavaScript running in the browser cannot access this cookie using document.cookie. This helps protect the token against certain XSS attacks.
            secure: true, //The cookie will only be sent over HTTPS connections.
            sameSite: "Strict", //The browser won't normally send this cookie with cross-site requests. This helps protect against CSRF attacks.
            maxAge: 15 * 60 * 1000
        })

        res.json({ message: "USER FOUND", email: find.email });
    }
})

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Not Authenticated" });

    try {
        //jwt.verify() validates the JWT’s signature using the secret key and checks claims like expiration. If valid, it returns the decoded payload; otherwise, it throws an error.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

app.get('/check_auth', verifyToken, (req, res) => {
    res.status(200).json({ authenticated: true });
});



app.post('/logout', verifyToken, (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: "strict",
        secure: true
    })

    res.json({ message: "Logged Out!" })
})


app.post('/sign_in', async (req, res) => {

    /*    
        Hashing — Definition
            Hashing converts data (like a password) into a fixed-length, one-way value.
            It cannot normally be reversed to get the original data.
      
            Important uses
            🔐 Password storage — store hashes instead of plain passwords.
            🔑 Data integrity — detect whether data has been changed.
            📁 File verification — verify downloaded files haven't been modified.
            🔎 Fast data lookup — hash tables/maps use hashing for efficient searching.
      
            bcrypt.hash(req.body.password, 10);
            req.body.password → user's plain-text password.
            bcrypt.hash() → hashes that password using bcrypt.
            10 → salt rounds / cost factor. Higher value = more computational work.
            bcrypt automatically generates a random salt and incorporates it into the hash.
            Result → a bcrypt hash that you store in the database instead of the actual password.

            Interview line:
            "bcrypt.hash() securely hashes the user's password using bcrypt and 10 salt rounds, producing a hash that can be stored in the database."

    */

    /*
    
        How hashing works
            Input: Takes data like a password.
            Hash function: Processes the input through a mathematical algorithm.
            Salt: For passwords, a random salt is added to make each hash unique.
            Output: Produces a fixed-format hash value.
            One-way: You can't directly convert the hash back into the original password.
            Verification: When logging in, the entered password is hashed/checked against the stored hash.

        
        Salt rounds / Cost factor
            Cost factor = how much computational work bcrypt performs to create the hash.
            In bcrypt.hash(password, 10), 10 is the cost factor.
            Each increase makes hashing slower and more CPU-intensive.
            This makes brute-force password guessing harder.
            It is called salt rounds because bcrypt's work factor is based on repeated key-expansion rounds.

            Interview line:
            “The cost factor determines how computationally expensive bcrypt hashing is. A higher value makes password cracking more difficult but also increases hashing time.”

            When bcrypt hashes a password, it generates a random salt.
            The salt is stored inside the bcrypt hash itself.
            So the database stores something like:
            bcrypt_hash = algorithm + cost + salt + hash
            During login, bcrypt takes the entered password and extracts the stored salt from the existing hash.
            It hashes the entered password using that same salt.
            If the resulting hash matches the stored hash → password is correct.

            So you don't need to store the salt separately.

            With bcrypt.compare()
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            req.body.password → password entered during login
            user.password → stored bcrypt hash containing the salt
            bcrypt extracts the salt → hashes the entered password → compares the result
            true → correct password
            false → incorrect password

            Interview line:

            “Bcrypt stores the salt along with the hash, so during login it extracts the same salt and uses it to hash the entered password for comparison.

    */

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let newUser = await usersModel.insertOne({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    });

    newUser.save();



    res.status(200).json({ message: "Welcome" })
})


app.post('/save', verifyToken, async (req, res) => {
    /*
    
            🔐 Encryption
            Encryption converts readable data (plaintext) into unreadable data (ciphertext) using an algorithm + key.
            It is reversible if you have the correct key.
            Used when data needs to be secured but later recovered.

            🔓 Decryption
            Decryption converts ciphertext back into plaintext using the correct key.
            Basically: Encryption → plaintext → ciphertext → Decryption → plaintext
            
            How encryption works
            Plaintext is given to an encryption algorithm.
            A key is used to encrypt it.
            An IV (Initialization Vector) may also be used.
            It produces ciphertext.
            During decryption, the same key + required IV are used to recover the original data.

    */
    try {
        const iv = crypto.randomBytes(16); //Initialization Vector. Generates a random 16-byte IV. IV adds randomness so encrypting the same data doesn't always produce the same ciphertext.
        const cipher = crypto.createCipheriv(algo, key, iv); // Creates a cipher object
        let encrypted = cipher.update(req.body.password, "utf8", "hex"); //Takes the password as UTF-8 plaintext. Encrypts it. Converts the encrypted output into hexadecimal format.
        encrypted += cipher.final("hex"); // finishes the encryption process and marks the end.
        console.log("ENCRYPTED PASSWORD: ", encrypted);

        /*
            Encryption produces binary bytes, not normal readable text.
                If you try to treat those bytes directly as a normal string, some bytes may be invalid/non-printable.

                So we convert:
                Binary ciphertext → Hexadecimal string

                Example:
                Binary: 10101100 00101101 ...
                Hex:    ac2d...

                Hex makes the encrypted data easy to store, transmit, and represent as a string.

                Why not normal "string"?
                Because encrypted bytes are not guaranteed to be valid UTF-8 text.

                Interview line:
                “Encryption produces binary data, so we encode it as hexadecimal to safely represent and store the ciphertext as a string.”
        
        */

        let user = await usersModel.findOne({ email: req.body.email });
        let id = user._id.toString();
        let newPassword = await passwordsModel.insertOne({
            userId: id,
            site: req.body.site,
            username: req.body.username,
            password: encrypted,
            encryptIV: iv.toString("hex")
            /*
                iv is a Buffer containing 16 random bytes.
                Those bytes may contain values that aren't safely representable as normal UTF-8 text.
                iv.toString("hex") converts those bytes into a safe text representation.
                Hex is also reversible — you can convert it back to the original bytes with Buffer.from(ivHex, "hex").
                You don't have to use hex specifically; Base64 is another common choice.
                Interview line:

                “The IV is binary data, so we encode it as hex before storing it in the database to safely represent the exact bytes as a string.”
            */
        })

        newPassword.save();
        res.status(200).json({ message: "Saved!" });
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
})

app.post("/retrieve_data", verifyToken, async (req, res) => {
    try {
        let user_mail = req.body.email;
        let user = await usersModel.findOne({ email: user_mail });
        let user_id = user._id.toString();
        // here lean sends direct json objects and does not wrap data inside _doc
        let saved_passwords = await passwordsModel.find({ userId: user_id }).lean();

        saved_passwords = saved_passwords.map(passes => {
            let iv = passes.encryptIV;
            iv = Buffer.from(iv, "hex");
            console.log("IV: ", iv);
            console.log("IV LENGTH: ", iv.length);
            const decipher = crypto.createDecipheriv(algo, key, iv);
            let decrypted = decipher.update(passes.password, "hex", "utf8");
            decrypted += decipher.final("utf8");
            /*
                decipher.update() decrypts the available chunks of ciphertext.
                Block-based algorithms like AES-CBC may have some remaining data internally due to block size/padding.
                decipher.final() tells the cipher: “No more ciphertext is coming; finish the decryption.”
                It also removes/validates padding.
                If the ciphertext/key/IV is invalid or padding is wrong, .final() can throw an error.

                So:
                let decrypted = decipher.update(encrypted, "hex", "utf8");
                decrypted += decipher.final("utf8");

                Think:
                update() → process the chunks
                final() → finish processing + handle padding + verify completion

                Interview line:
                “final() completes the decryption process, handles the remaining data and validates/removes padding. It also ensures the ciphertext was decrypted correctly.”

            */
            return { ...passes, password: decrypted }
        })


        let retrieved_passwords = [{}];
        retrieved_passwords = saved_passwords;
        console.log("RETRIEVED PASSES : ", retrieved_passwords);
        res.status(200).json(retrieved_passwords);
    }
    catch (err) {
        res.status(400).json({ message: "Encryption Error" });
    }
})



app.post('/delete_record', verifyToken, async (req, res) => {
    let obj_id = req.body.id.toString();
    console.log("DELETE ROUTE, id: ", req.body.id);
    let find = await passwordsModel.findOne({ _id: obj_id });
    console.log("DELETE FOUND ", find);
    await passwordsModel.deleteOne({ _id: req.body.id });
    res.status(200).json({ message: "Deleted" });
})


app.listen(port, () => {
    console.log("server is running");
})