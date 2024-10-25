// JavaScript implementation of Columnar Transposition
let key = "HACK";

// Function to get the matrix as a single array
function getMatrix(msg) {
    // track key indices
    let k_indx = 0;

    const msg_len = msg.length;
    const msg_lst = Array.from(msg);
    const key_lst = Array.from(key).sort();

    // calculate column of the matrix
    const col = key.length;

    // calculate maximum row of the matrix
    const row = Math.ceil(msg_len / col);

    // add the padding character '_' in empty cells of the matrix
    const fill_null = (row * col) - msg_len;
    for (let i = 0; i < fill_null; i++) {
        msg_lst.push('_');
    }

    // create Matrix and insert message and padding characters row-wise
    const matrix = [];
    for (let i = 0; i < msg_lst.length; i += col) {
        matrix.push(msg_lst.slice(i, i + col));
    }

    return matrix; // Return the matrix
}

// Function to display the matrix and plaintext
function displayMatrix(msg) {
    const matrix = getMatrix(msg);
    console.log("Matrix from Plaintext:");
    console.table(matrix); // Displaying the matrix in a table format
    return matrix; // Return the matrix for further processing if needed
}

// Encryption
function encryptMessage(msg) {
    let cipher = "";

    // track key indices
    let k_indx = 0;

    const msg_len = msg.length;
    const msg_lst = Array.from(msg);
    const key_lst = Array.from(key).sort();

    // calculate column of the matrix
    const col = key.length;

    // calculate maximum row of the matrix
    const row = Math.ceil(msg_len / col);

    // add the padding character '_' in empty cells of the matrix
    const fill_null = (row * col) - msg_len;
    for (let i = 0; i < fill_null; i++) {
        msg_lst.push('_');
    }

    // create Matrix and insert message and padding characters row-wise
    const matrix = [];
    for (let i = 0; i < msg_lst.length; i += col) {
        matrix.push(msg_lst.slice(i, i + col));
    }

    // Display the matrix during encryption
    console.log("Matrix used for Encryption:");
    console.table(matrix); // Displaying the matrix in a table format

    // read matrix column-wise using key
    for (let _ = 0; _ < col; _++) {
        const curr_idx = key.indexOf(key_lst[k_indx]);
        for (const row of matrix) {
            cipher += row[curr_idx];
        }
        k_indx++;
    }

    return cipher;
}

// Decryption
function decryptMessage(cipher) {
    let msg = "";

    // track key indices
    let k_indx = 0;

    // track msg indices
    let msg_indx = 0;
    const msg_len = cipher.length;
    const msg_lst = Array.from(cipher);

    // calculate column of the matrix
    const col = key.length;

    // calculate maximum row of the matrix
    const row = Math.ceil(msg_len / col);

    // convert key into list and sort alphabetically
    const key_lst = Array.from(key).sort();

    // create an empty matrix to store deciphered message
    const dec_cipher = [];
    for (let i = 0; i < row; i++) {
        dec_cipher.push(Array(col).fill(null));
    }

    // Arrange the matrix column-wise according to permutation order
    for (let _ = 0; _ < col; _++) {
        const curr_idx = key.indexOf(key_lst[k_indx]);

        for (let j = 0; j < row; j++) {
            dec_cipher[j][curr_idx] = msg_lst[msg_indx];
            msg_indx++;
        }
        k_indx++;
    }

    // convert decrypted msg matrix into a string
    try {
        msg = dec_cipher.flat().join('');
    } catch (err) {
        throw new Error("This program cannot handle repeating words.");
    }

    const null_count = (msg.match(/_/g) || []).length;

    if (null_count > 0) {
        return msg.slice(0, -null_count);
    }

    return msg;
}

// Driver Code
const msg = "jamal ardi";

// Display the matrix from plaintext
const matrix = displayMatrix(msg);
console.log("Plaintext:", msg);

const cipher = encryptMessage(msg);
console.log("Encrypted Message: " + cipher);

console.log("Decrypted Message: " + decryptMessage(cipher));