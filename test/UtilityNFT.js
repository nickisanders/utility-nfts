const { expect } = require("chai");

const brandName = "";
const nftName = "Taylor NFT";
const nftSymbol = "TNFT";
const nftMetadataBaseUri = "https://google.com";

describe("ContractProxy", function () {
  let utilityNftProxy;
  let owner;
  let addr1;

  async function deployContractsOpenZeppelin() {
    [owner, addr1] = await ethers.getSigners();
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    const proxyAdmin = await ProxyAdmin.deploy();
    await proxyAdmin.deployed();
    const UtilityNft = await ethers.getContractFactory("UtilityNft");
    const utilityNft = await upgrades.deployProxy(UtilityNft, [nftName, nftSymbol, nftMetadataBaseUri], {initializer: 'initialize'});
    

    const utilityNftAddress = await utilityNft.address;
    const proxyAdminAddress = await proxyAdmin.address;
    
    await upgrades.admin.changeProxyAdmin(utilityNftAddress, proxyAdminAddress);
    utilityNftProxy = await ethers.getContractAt("UtilityNft", utilityNftAddress);
  }

  async function deployContractsRaw() {
    function getInitializerData(contractInterface, args) {
      const initializer = "initialize";
      const fragment = contractInterface.getFunction(initializer);
      return contractInterface.encodeFunctionData(fragment, args);
    }

    [owner, addr1] = await ethers.getSigners();
    let proxyAdminAddress;
    const brandNftProxyAdminAddress = process.env[brandName];
    if (!brandNftProxyAdminAddress) {
      const proxyAdmin = await ethers.deployContract("ContractProxyAdmin");
      await proxyAdmin.waitForDeployment();
      proxyAdminAddress = await proxyAdmin.getAddress();
    } else {
      proxyAdminAddress = brandNftProxyAdminAddress;
    }
  
    const utilityNft = await ethers.deployContract("UtilityNft");
    await utilityNft.waitForDeployment();
  
    const utilityNftAddress = await utilityNft.getAddress();

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
  
    const proxyAddress = await proxy.getAddress();
    utilityNftProxy = await ethers.getContractAt("UtilityNft", proxyAddress);
  }

  beforeEach(async function () {
    await deployContractsOpenZeppelin();
  });

  it("should mint and activate NFT", async function () {
    const tokenId = 1;

    const res = await utilityNftProxy.mint(addr1.address, tokenId);
    expect(await utilityNftProxy.isActivated(tokenId)).to.equal(false);

    await utilityNftProxy.connect(addr1).activate(tokenId);

    expect(await utilityNftProxy.isActivated(tokenId)).to.equal(true);
  });

  it("should allow transfer of unactivated NFTs", async function () {
    const tokenId = 1;

    await utilityNftProxy.mint(addr1.address, tokenId);

    await utilityNftProxy
      .connect(addr1)
      .transferFrom(addr1.address, owner.address, tokenId);
  });

  it("should prevent transfer of activated NFTs", async function () {
    const tokenId = 1;

    await utilityNftProxy.mint(addr1.address, tokenId);
    await utilityNftProxy.connect(addr1).activate(tokenId);

    await expect(
    utilityNftProxy.connect(addr1).transferFrom(addr1.address, owner.address, tokenId)
    ).to.be.revertedWith("Already activated");
  });

  it("should prevent activating an already activated NFT", async function () {
    const tokenId = 1;

    await utilityNftProxy.mint(addr1.address, tokenId);
    await utilityNftProxy.connect(addr1).activate(tokenId);

    await expect(
    utilityNftProxy.connect(addr1).activate(tokenId)
    ).to.be.revertedWith("Already activated");
  });
});
