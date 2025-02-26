import "dotenv/config";
import { Odyssey, BN, Buffer } from "../src";
import {
  OmegaVMAPI,
  KeyChain as OmegaKeyChain
} from "../src/apis/omegavm";
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx
} from "../src/apis/delta";
import {
  Defaults,
  costExportTx
} from "../src/utils";
import Web3 from "web3";

// Fetch command-line arguments
const args = process.argv.slice(2);
console.log(args)

if (args.length < 3) {
  console.error("Usage: node script.js <PRIVATE_KEY> <WALLET_ADDRESS> <DIONE_AMOUNT>");
  process.exit(1);
}

const [privateKeyArg, walletAddressArg, dioneAmountArg] = args;
console.log("arfssssssss", args)
// Validate environment variables
const ip = process.env.TEST_IP;
const port = Number(process.env.ODYSSEY_PORT);
const protocol = process.env.PROTOCOL;
const networkID = Number(process.env.TEST_NETWORK_ID);

if (!ip || !port || !protocol || !networkID) {
  throw new Error('Missing required environment variables: TEST_IP, ODYSSEY_PORT, PROTOCOL, or TEST_NETWORK_ID');
}

const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID);
const ochain: OmegaVMAPI = odyssey.OChain();
const dchain: DELTAAPI = odyssey.DChain();

const privKey: Buffer = new Buffer(privateKeyArg.slice(2), "hex");
const oKeychain: OmegaKeyChain = ochain.keyChain();
const dKeychain: DELTAKeyChain = dchain.keyChain();
oKeychain.importKey(privKey);
dKeychain.importKey(privKey);

const oAddressStrings: string[] = ochain.keyChain().getAddressStrings();
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings();

if (!Defaults.network[networkID]) {
  throw new Error(`Network ID ${networkID} is not defined in Defaults.`);
}

const oChainBlockchainIdStr: string = Defaults.network[networkID]?.O?.blockchainID;
const dioneAssetID: any = Defaults.network[networkID]?.A?.dioneAssetID;

if (!oChainBlockchainIdStr || !dioneAssetID) {
  throw new Error('Failed to retrieve blockchain ID or asset ID from Defaults.');
}

const dHexAddress: string = walletAddressArg;
const path: string = "/ext/bc/D/rpc";
const web3: any = new Web3(`${protocol}://${ip}${path}`);
const threshold: number = 1;

const main = async (): Promise<any> => {
  try {
    console.log('Processing transaction...');
    console.log('Environment Variables:', { ip, port, protocol, networkID });
    console.log('Wallet Address:', dHexAddress);

    const baseFeeResponse: string = await dchain.getBaseFee();
    const baseFee = new BN(parseInt(baseFeeResponse, 16));
    const txcount = await web3.eth.getTransactionCount(dHexAddress);
    const nonce: number = Number(txcount);
    const locktime: BN = new BN(0);
    let dioneAmount: BN = new BN(dioneAmountArg);
    let fee: BN = baseFee.div(new BN(1e9)).add(new BN(1));

    let unsignedTx: UnsignedTx = await dchain.buildExportTx(
      dioneAmount,
      dioneAssetID,
      oChainBlockchainIdStr,
      dHexAddress,
      dAddressStrings[0],
      oAddressStrings,
      nonce,
      locktime,
      threshold,
      fee
    );

    const exportCost: number = costExportTx(unsignedTx);
    fee = fee.mul(new BN(exportCost));

    unsignedTx = await dchain.buildExportTx(
      dioneAmount,
      dioneAssetID,
      oChainBlockchainIdStr,
      dHexAddress,
      dAddressStrings[0],
      oAddressStrings,
      nonce,
      locktime,
      threshold,
      fee
    );

    const tx: Tx = unsignedTx.sign(dKeychain);
    const txid: string = await dchain.issueTx(tx);
    console.log(`Success! TXID: ${txid}`);
    console.log(oAddressStrings)
    return {
      status: 'success',
      message: 'Transaction processed successfully',
      txid: txid,
      oAddressStrings
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

main();
