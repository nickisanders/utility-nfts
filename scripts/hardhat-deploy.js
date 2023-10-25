// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
require('dotenv').config()

const brandName = "taylortest";
const nftName = "Taylor NFT";
const nftSymbol = "TNFT";
const nftMetadataBaseUri = "https://google.com";
const baseContractName = "UtilityNft" //Or CollectibleNft

async function main() {
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    const proxyAdmin = await ProxyAdmin.deploy();
    await proxyAdmin.deployed();
    const UtilityNft = await ethers.getContractFactory(baseContractName);
    const utilityNft = await upgrades.deployProxy(UtilityNft, [nftName, nftSymbol, nftMetadataBaseUri], {initializer: 'initialize'});
    

    const utilityNftAddress = await utilityNft.address;
    const proxyAdminAddress = await proxyAdmin.address;
    console.log(`ProxyAddress: ${utilityNftAddress}, ProxyAdminAddress ${proxyAdminAddress}`)
    
    await upgrades.admin.changeProxyAdmin(utilityNftAddress, proxyAdminAddress);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
