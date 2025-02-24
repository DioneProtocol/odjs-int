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

const ip = process.env.TEST_IP
const port = Number(process.env.ODYSSEY_PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.TEST_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)

const key = process.env.PRIVATE_KEY1 ?? ""
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
const d : any = ochain.getDIONEAssetID().then(res=>console.log(res))
console.log("d",d)
console.log('dioneAssetID', dioneAssetID)
const dHexAddress: string = "0x6E544dc29DDb92fC4E54bd8B19ccC8769E9Be4FE"
const threshold: number = 1
//238095238095238

const main = async (): Promise<any> => {
  
  const baseFeeResponse: string = await dchain.getBaseFee()
  const baseFee = new BN(parseInt(baseFeeResponse, 16))
  console.log(baseFee.toString())
  const txcount = await web3.eth.getTransactionCount(dHexAddress)
  const nonce: number = Number(txcount)
  const locktime: BN = new BN(0)
  let dioneAmount: BN = new BN(10000000000)
  console.log(dioneAmount.toString())
  let fee: BN = baseFee.div(new BN(1e9))
  console.log(fee.toString())
  fee = fee.add(new BN(1))
  console.log(fee.toString())

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
