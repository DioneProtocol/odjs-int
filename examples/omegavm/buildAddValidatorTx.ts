import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "../../src/apis/omegavm"
import {
  DefaultLocalGenesisPrivateKey,
  UnixNow
} from "../../src/utils"

const ip = process.env.TEST_IP
const port = Number(process.env.ODYSSEY_PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.TEST_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const oKeychain: KeyChain = ochain.keyChain()
const privKey: Buffer = new Buffer("19c1b4b6f406696e350de886e5164502c0a16f837e06f738c80deecadb7053ef", "hex")
oKeychain.importKey(privKey)
const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "OmegaVM utility method buildAddValidatorTx to add a validator to the primary subnet"
)

const reward = "O-testnet1n5qrhn6cnqhda5usk8du4s676tjpcvv00j9qth" // replace this
const nodeID: string = "NodeID-DE8BWpgUtNkTXzjFArzS1nroouzBcXX8J" // replace this

const asOf: BN = UnixNow()
const startTime: BN = UnixNow().add(new BN(60 * 1))
const endTime: BN = startTime.add(new BN(60 * 60 * 24 * 1000))
const delegationFee: number = 10
//5*10^14
//500 000 
const main = async (): Promise<any> => {
  const stakeAmount: any = await ochain.getMinStake()
  console.log(stakeAmount.minValidatorStake.toString())
  const omegaVMUTXOResponse: any = await ochain.getUTXOs(oAddressStrings)
  const utxoSet: UTXOSet = omegaVMUTXOResponse.utxos
  const unsignedTx: UnsignedTx = await ochain.buildAddValidatorTx(
    utxoSet,
    oAddressStrings,
    oAddressStrings,
    oAddressStrings,
    nodeID,
    startTime,
    endTime,
    stakeAmount.minValidatorStake,
    [reward],
    delegationFee,
    locktime,
    threshold,
    memo,
    asOf
  )

  const tx: Tx = unsignedTx.sign(oKeychain)
  const txid: string = await ochain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main().catch((e) => console.log(e))
