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
// If brand proxyAdmin is deployed skip, else deploy proxy admin
// Deploy Contract
// Use proxyAdmin address and contract address to deploy transparent upgradeable proxy nft
//

async function main() {
  function getInitializerData(contractInterface, args) {
    const initializer = "initialize";
    const fragment = contractInterface.getFunction(initializer);
    return contractInterface.encodeFunctionData(fragment, args);
  }
  let proxyAdminAddress;
  const brandNftProxyAdminAddress = process.env[`${brandName}ProxyAdminKey`];
  if (!brandNftProxyAdminAddress) {
    console.log(`Deploying NftProxyAdmin for brand: ${brandName}`);
    const proxyAdmin = await ethers.deployContract("ContractProxyAdmin");
    await proxyAdmin.waitForDeployment();
    console.log(
      `NftProxyAdmin deployed to: ${await proxyAdmin.getAddress()}. PLEASE ADD THIS TO THE ENV FILE`
    );
    proxyAdminAddress = await proxyAdmin.getAddress();
  } else {
    proxyAdminAddress = brandNftProxyAdminAddress;
  }

  console.log(`Deploying utilityNft`);
  const utilityNft = await ethers.deployContract("UtilityNft");
  await utilityNft.waitForDeployment();

  const utilityNftAddress = await utilityNft.getAddress();
  console.log(`utilityNft Deployed (unititialized) to ${utilityNftAddress}`);

  const UtilityNft = await ethers.getContractFactory("UtilityNft");
  const ContractProxy = await ethers.getContractFactory("ContractProxy");

  const proxy = await ContractProxy.deploy(
    utilityNftAddress,
    proxyAdminAddress,
    getInitializerData(UtilityNft.interface, [
      nftName,
      nftSymbol,
      nftMetadataBaseUri,
    ])
  );
  await proxy.waitForDeployment();
  console.log("Proxy Contract deployed to:", await proxy.getAddress());

  const proxyAddress = await proxy.getAddress();
  console.log(
    `Admin Address: ${proxyAdminAddress}\nImplementationAddress: ${utilityNftAddress}\nProxy Address: ${proxyAddress}`
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
