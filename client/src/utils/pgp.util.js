import * as openpgp from 'openpgp';

const downloadKeyData = (username, passphrase, publicKeyArmored, privateKeyArmored)=>{
    const element = document.createElement("a");

    let dataToWrite = username + '\n\n' + passphrase + '\n\n' + publicKeyArmored + '\n' + privateKeyArmored;

    const file = new Blob([dataToWrite], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);

    element.download = "PGP_KEY_BACKUP.txt";
    document.body.appendChild(element);

    element.click();
};

//generate pgp keypair
const generateKeypair = async ({passphrase, save})=>{
    const { privateKey, publicKey } = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 4096,
        userIDs: [{ userID: 'Anonymous' }],
        passphrase: passphrase
    });

    if(save){ //save keypair to browser localstorage if applicable, never save passphrase
        localStorage.setItem('keypair', JSON.stringify({ privateKey, publicKey, passphrase: '' }));
    }

    downloadKeyData(passphrase, publicKey, privateKey);

    return { privateKey, publicKey, passphrase };
};

//encrypt message
const encryptMessage = async (publicKeyArmored, message)=>{
    //parse public key
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

    const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: publicKey
    });

    return encrypted;
};

//decrypt message
const decryptMessage = async (privateKeyArmored, passphrase, armoredMessage)=>{
    try{
        // parse armored message
        const message = await openpgp.readMessage({
            armoredMessage: armoredMessage
        });
        // parse private key
        const privateKey = await openpgp.decryptKey({
            privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
            passphrase
        });
        // decrypt message
        const { data: decrypted, signatures } = await openpgp.decrypt({
            message,
            decryptionKeys: [privateKey]
        });

        return decrypted;
    } catch(e){
        console.log(e);
        return '[!] Failed to decrypt message.';
    }
};

export {
    generateKeypair,
    encryptMessage,
    decryptMessage
};