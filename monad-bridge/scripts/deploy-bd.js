/*const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with:', deployer.address);

  const USDT = await ethers.getContractFactory('MockUSDT');
  const usdt = await USDT.deploy();
  await usdt.waitForDeployment()
  console.log('USDT deployed to:', usdt.address);

  const NFTVault = await ethers.getContractFactory('NFTCollateralVault');
  const vault = await NFTVault.deploy();
  console.log('NFT Vault deployed to:', vault.address);

  const LoanManager = await ethers.getContractFactory('LoanManager');
  const loanManager = await LoanManager.deploy(usdt.address, vault.address);
  console.log('LoanManager deployed to:', loanManager.address);

  const LiquidationManager = await ethers.getContractFactory(
    'LiquidationManager'
  );
  const liquidationManager = await LiquidationManager.deploy(
    usdt.address,
    vault.address,
    '0xPythOracleAddress'
  );
  console.log('LiquidationManager deployed to:', liquidationManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
*/


////////////////////////////////////////////
  const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy Mock USDT
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  // await usdt.deployed();
  await usdt.waitForDeployment();
  const UsdtAddress = await usdt.getAddress();
  console.log("USDT deployed to:", UsdtAddress);

  // Deploy USDT Liquidity Pool
  const USDTLiquidityPool = await ethers.getContractFactory("USDTLiquidityPool");
  console.log(`Deploying USDTLiquidityPool contract!!!!!!!!!!!`);
  const liquidityPool = await USDTLiquidityPool.deploy(UsdtAddress);
  // await liquidityPool.deployed();
  await liquidityPool.waitForDeployment();
  const liquidityPoolAddress = await liquidityPool.getAddress();
  console.log("USDT Liquidity Pool deployed to:", liquidityPoolAddress);

  // Deploy NFT Vault
  const NFTCollateralVault = await ethers.getContractFactory("NFTCollateralVault");
  console.log(`Deploying NFTCollateralVault contract!!!!!!!!!!!`);
  const vault = await NFTCollateralVault.deploy();
  // await vault.deployed();
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("NFT Vault deployed to:", vaultAddress);

  // Deploy Loan Manager
  const LoanManager = await ethers.getContractFactory("LoanManager");
  console.log(`Deploying LoanManager contract!!!!!!!!!!!`);
  const loanManager = await LoanManager.deploy(UsdtAddress, vaultAddress, liquidityPoolAddress);
  // await loanManager.deployed();
  await loanManager.waitForDeployment();
  const loanManagerAddress = await loanManager.getAddress();
  console.log("LoanManager deployed to:", loanManagerAddress);

  // Deploy Liquidation Manager
  const LiquidationManager = await ethers.getContractFactory("LiquidationManager");
  console.log(`Deploying LiquidationManager contract!!!!!!!!!!!`);
  const liquidationManager = await LiquidationManager.deploy(UsdtAddress, vaultAddress, liquidityPoolAddress);
  // await liquidationManager.deployed();
  await liquidationManager.waitForDeployment();
  const liquidationManagerAddress = await liquidationManager.getAddress();
  console.log("LiquidationManager deployed to:", liquidationManagerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
