import "dotenv/config";
import { Odyssey, BN, Buffer } from "../src";
import {
  OmegaVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../src/apis/omegavm";
import {
  DefaultLocalGenesisPrivateKey,
  Defaults,
  UnixNow
} from "../src/utils";

// Fetch the private key from the command-line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("Usage: npx ts-node script.ts <PRIVATE_KEY>");
  process.exit(1);
}

const privateKeyArg = args[0];

// Validate the private key format
if (!/^0x[0-9a-fA-F]{64}$/.test(privateKeyArg)) {
  console.error("Invalid private key format. It should be a 64-character hexadecimal string prefixed with '0x'.");
  process.exit(1);
}

const ip = process.env.TEST_IP;
const port = Number(process.env.ODYSSEY_PORT);
const protocol = process.env.PROTOCOL;
const networkID = Number(process.env.TEST_NETWORK_ID);

// Initialize the Odyssey instance
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID);
const ochain: OmegaVMAPI = odyssey.OChain();
const oKeychain: KeyChain = ochain.keyChain();

// Import the private key from the command-line argument
const privKey: Buffer = Buffer.from(privateKeyArg.slice(2), "hex");
oKeychain.importKey(privKey);

const oAddressStrings: string[] = ochain.keyChain().getAddressStrings();
const dChainBlockchainID: string = Defaults.network[networkID].D.blockchainID;
const oChainBlockchainID: string = Defaults.network[networkID].O.blockchainID;
const threshold: number = 1;
const locktime: BN = new BN(0);
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildImportTx to import DIONE to the O-Chain from the A-Chain"
);
const asOf: BN = UnixNow();

const main = async (): Promise<any> => {
  try {
    // Fetch UTXOs for the provided addresses
    const omegaVMUTXOResponse: any = await ochain.getUTXOs(
      oAddressStrings,
      dChainBlockchainID
    );
    const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos;

    // Build the unsigned transaction
    const unsignedTx: UnsignedTx = await ochain.buildImportTx(
      utxoSet,
      oAddressStrings,
      dChainBlockchainID,
      oAddressStrings,
      oAddressStrings,
      oAddressStrings,
      memo,
      asOf,
      locktime,
      threshold
    );

    // Sign the transaction with the provided private key
    const tx: Tx = unsignedTx.sign(oKeychain);
    
    // Issue the transaction
    const txid: string = await ochain.issueTx(tx);
    
    // Return or log the transaction ID upon success
    console.log(`Success! TXID: ${txid}`);
    return {
        status: 'success',
        message: 'Transaction processed successfully',
        txid: txid
      };
  } catch (e: any) {
    const errorMessage = e?.message || 'Unknown error';
    if (errorMessage.includes('insufficient funds')) {
      console.error('Error: Insufficient funds in the wallet to complete this transaction.');
    } else if (errorMessage.includes('connectivity')) {
      console.error('Error: Unable to connect to the network. Check your connection settings.');
    } else {
      console.error('Unexpected Error:', errorMessage);
    }
    console.error('Full error details:', e);
  }
};

// Execute the main function and log the result
main()