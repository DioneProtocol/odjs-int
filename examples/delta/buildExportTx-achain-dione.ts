import "dotenv/config"
import { Odyssey, BN,Buffer } from "../../src"
import { Web3 } from "web3"
import { ALPHAAPI, KeyChain as ALPHAKeyChain } from "../../src/apis/alpha"
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
const ip = process.env.TEST_IP
const port = Number(process.env.ODYSSEY_PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.TEST_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const achain: ALPHAAPI = odyssey.AChain()
const dchain: DELTAAPI = odyssey.DChain()
const aKeychain: ALPHAKeyChain = achain.keyChain()
const dKeychain: DELTAKeyChain = dchain.keyChain()
const key = "fcc3f0b0e8a622b50ff969c4f4f12f572c77b1b03429441df3b9c2617d126470"
const privKey: Buffer = new Buffer(key, "hex")

aKeychain.importKey(privKey)
dKeychain.importKey(privKey)
const aAddressStrings: string[] = achain.keyChain().getAddressStrings()
console.log(aAddressStrings)
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
console.log(dAddressStrings)

const aChainBlockchainIdStr: string = Defaults.network[networkID].A.blockchainID
const dioneAssetID: string = Defaults.network[networkID].A.dioneAssetID
const dHexAddress: string = "0x26e7CDeb1Eb11C18Fa760dc27C0Aab7653258612"
const path: string = "/ext/bc/D/rpc"
const web3 = new Web3(`${protocol}://${ip}:${port}${path}`)
const threshold: number = 1

const main = async (): Promise<any> => {
  let balance: any = await web3.eth.getBalance(dHexAddress)
  balance = new BN(balance.toString().substring(0, 17))
  console.log(balance.toString())
  const baseFeeResponse: string = await dchain.getBaseFee()
  const baseFee = new BN(parseInt(baseFeeResponse, 16))
  const txcount = await web3.eth.getTransactionCount(dHexAddress)
  const nonce: number = Number(txcount)
  const locktime: BN = new BN(0)
  let dioneAmount: BN = new BN(2000000000)
  console.log(dioneAmount.toString())
  let fee: BN = baseFee.div(new BN(1e9))
  fee = fee.add(new BN(1))
  console.log(fee.toString())

  let unsignedTx: UnsignedTx = await dchain.buildExportTx(
    dioneAmount,
    dioneAssetID,
    aChainBlockchainIdStr,
    dHexAddress,
    dAddressStrings[0],
    aAddressStrings,
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
    aChainBlockchainIdStr,
    dHexAddress,
    dAddressStrings[0],
    aAddressStrings,
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
