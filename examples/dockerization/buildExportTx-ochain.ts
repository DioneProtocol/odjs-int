import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import {
  OmegaVMAPI,
  KeyChain as OmegaKeyChain
} from "../../src/apis/omegavm"
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx
} from "../../src/apis/delta"
import {
  DefaultLocalGenesisPrivateKey,
  Defaults,
  costExportTx
} from "../../src/utils"
import Web3 from "web3"

// Read configuration from environment variables
const ip = process.env.TEST_IP
const port = Number(process.env.ODYSSEY_PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.TEST_NETWORK_ID)

if (!ip || !port || !protocol || !networkID) {
  throw new Error("Missing required environment variables for network configuration")
}

const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)

const key = process.env.PRIVATE_KEY1 ?? ""
if (!key) {
  throw new Error("PRIVATE_KEY1 is not set in the environment")
}

const path: string = "/ext/bc/D/rpc"
const web3: any = new Web3(`${protocol}://${ip}${path}`)
const privKey: Buffer = new Buffer(key, "hex")

const ochain: OmegaVMAPI = odyssey.OChain()
const dchain: DELTAAPI = odyssey.DChain()

const oKeychain: OmegaKeyChain = ochain.keyChain()
const dKeychain: DELTAKeyChain = dchain.keyChain()

oKeychain.importKey(privKey)
dKeychain.importKey(privKey)

const oAddressStrings: string[] = ochain.keyChain().getAddressStrings()
console.log(Defaults.network[networkID])
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const oChainBlockchainIdStr: string = Defaults.network[networkID].O.blockchainID
const dioneAssetID: string = Defaults.network[networkID].O.dioneAssetID

// Read dioneAmount from the environment file
const dioneAmountEnv = process.env.DIONE_AMOUNT
if (!dioneAmountEnv) {
  throw new Error("DIONE_AMOUNT environment variable is not set")
}
let dioneAmount: BN = new BN(dioneAmountEnv)

console.log("dioneAmount:", dioneAmount.toString())

const dHexAddress: string = "0x6E544dc29DDb92fC4E54bd8B19ccC8769E9Be4FE"
const threshold: number = 1

const main = async (): Promise<any> => {
  const baseFeeResponse: string = await dchain.getBaseFee()
  const baseFee = new BN(parseInt(baseFeeResponse, 16))
  console.log("baseFee:", baseFee.toString())

  const txcount = await web3.eth.getTransactionCount(dHexAddress)
  const nonce: number = Number(txcount)
  const locktime: BN = new BN(0)
  
  console.log("dioneAmount:", dioneAmount.toString())
  let fee: BN = baseFee.div(new BN(1e9))
  console.log("Initial fee:", fee.toString())
  
  fee = fee.add(new BN(1))
  console.log("Fee after adding 1:", fee.toString())

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
  )
  const exportCost: number = costExportTx(unsignedTx)
  fee = fee.mul(new BN(exportCost))

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
  )

  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
