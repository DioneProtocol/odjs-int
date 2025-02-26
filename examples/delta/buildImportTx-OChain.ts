import "dotenv/config"
import { Odyssey, BN, Buffer } from "../../src"
import { OmegaVMAPI, KeyChain as OmegaVMKeyChain } from "../../src/apis/omegavm"
import {
  DELTAAPI,
  KeyChain as DELTAKeyChain,
  UnsignedTx,
  Tx,
  UTXOSet
} from "../../src/apis/delta"
import {
  DefaultLocalGenesisPrivateKey,
  Defaults,
  costImportTx
} from "../../src/utils"

const ip = process.env.TEST_IP
const port = Number(process.env.ODYSSEY_PORT)
const protocol = process.env.PROTOCOL
const networkID = Number(process.env.TEST_NETWORK_ID)
const odyssey: Odyssey = new Odyssey(ip, port, protocol, networkID)
const ochain: OmegaVMAPI = odyssey.OChain()
const dchain: DELTAAPI = odyssey.DChain()
const oKeychain: OmegaVMKeyChain = ochain.keyChain()
const dHexAddress: string = ""
const privKey: Buffer = new Buffer("", "hex")

const dKeychain: DELTAKeyChain = dchain.keyChain()
oKeychain.importKey(privKey)
dKeychain.importKey(privKey)
const dAddressStrings: string[] = dchain.keyChain().getAddressStrings()
const oChainBlockchainId: string = Defaults.network[networkID].O.blockchainID

const main = async (): Promise<any> => {
  const baseFeeResponse: string = await dchain.getBaseFee()
  const baseFee = new BN(parseInt(baseFeeResponse, 16) / 1e9)
  let fee: BN = baseFee
  const deltaUTXOResponse: any = await dchain.getUTXOs(
    dAddressStrings,
    oChainBlockchainId
  )
  console.log(deltaUTXOResponse)
  const utxoSet: UTXOSet = deltaUTXOResponse.utxos
  let unsignedTx: UnsignedTx = await dchain.buildImportTx(
    utxoSet,
    dHexAddress,
    dAddressStrings,
    oChainBlockchainId,
    dAddressStrings,
    fee
  )
  const importCost: number = costImportTx(unsignedTx)
  fee = baseFee.mul(new BN(importCost))

  unsignedTx = await dchain.buildImportTx(
    utxoSet,
    dHexAddress,
    dAddressStrings,
    oChainBlockchainId,
    dAddressStrings,
    fee
  )

  const tx: Tx = unsignedTx.sign(dKeychain)
  const txid: string = await dchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()
