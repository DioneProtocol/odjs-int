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
  UnixNow
} from "../src/utils";

// Fetch command-line arguments
const args = process.argv.slice(2);
if (args.length < 7) {
  console.error("Usage: npx ts-node script.ts <PRIVATE_KEY> <REWARD> <NODE_ID> <START_TIME> <END_TIME> <DELEGATION_FEE> <STAKE_AMOUNT>");
  process.exit(1);
}

const [privateKeyArg, reward, nodeID, startTimeArg, endTimeArg, delegationFeeArg, stakeAmountArg] = args;

// Validate environment variables
const ip = process.env.TEST_IP;
const port = Number(process.env.ODYSSEY_PORT);
const protocol = process.env.PROTOCOL;
const networkID = Number(process.env.TEST_NETWORK_ID);
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID);
const ochain: OmegaVMAPI = odyssey.OChain();
const oKeychain: KeyChain = ochain.keyChain();
const privKey: Buffer = new Buffer(privateKeyArg, "hex");
oKeychain.importKey(privKey);
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings();

const threshold: number = 1;
const locktime: BN = new BN(0);
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildAddValidatorTx to add a validator to the primary subnet"
);

// Convert startTime and endTime to BN
const startTime: BN = new BN(Number(startTimeArg));
const endTime: BN = new BN(Number(endTimeArg));

// Convert delegationFee to a number
const delegationFee: number = Number(delegationFeeArg);

// Convert stakeAmount to BN
const stakeAmount: BN = new BN(stakeAmountArg);

const asOf: BN = UnixNow();

const main = async (): Promise<any> => {
  try {
    // Get the minimum stake amount
    const stakeAmountResponse: any = await ochain.getMinStake();

    // Fetch UTXOs
    const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings);
    const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos;

    // Build the add validator transaction
    const unsignedTx: UnsignedTx = await ochain.buildAddValidatorTx(
      utxoSet,
      oAddressStrings,
      oAddressStrings,
      oAddressStrings,
      nodeID,
      startTime,
      endTime,
      stakeAmountResponse.minValidatorStake || stakeAmount,
      [reward],
      delegationFee,
      locktime,
      threshold,
      memo,
      asOf
    );

    // Sign the transaction
    const tx: Tx = unsignedTx.sign(oKeychain);

    // Issue the transaction
    const txid: string = await ochain.issueTx(tx);

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

main();
