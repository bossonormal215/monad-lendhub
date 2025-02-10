const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('NFT Lending Platform', function () {
  let owner, user1, user2;
  let mockUSDT, nftVault, loanManager, liquidationManager;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Mock USDT
    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();

    // Deploy NFT Vault
    const NFTCollateralVault = await ethers.getContractFactory(
      'NFTCollateralVault'
    );
    nftVault = await NFTCollateralVault.deploy();
    await nftVault.deployed();

    // Deploy Loan Manager
    const LoanManager = await ethers.getContractFactory('LoanManager');
    loanManager = await LoanManager.deploy(mockUSDT.address, nftVault.address);
    await loanManager.deployed();

    // Deploy Mock Liquidation Manager
    const LiquidationManager = await ethers.getContractFactory(
      'LiquidationManager'
    );
    liquidationManager = await LiquidationManager.deploy(
      mockUSDT.address,
      nftVault.address,
      '0xPythOracleAddress'
    );
    await liquidationManager.deployed();
  });

  it('Should mint mock USDT and transfer to user1', async function () {
    await mockUSDT.mint(user1.address, ethers.utils.parseEther('1000'));
    const balance = await mockUSDT.balanceOf(user1.address);
    expect(balance).to.equal(ethers.utils.parseEther('1000'));
  });

  it('Should deposit an NFT as collateral', async function () {
    await nftVault
      .connect(user1)
      .depositNFT('0xNFTContract', 1, ethers.utils.parseEther('100'));
    const collateral = await nftVault.collaterals(1);
    expect(collateral.owner).to.equal(user1.address);
    expect(collateral.loanAmount).to.equal(ethers.utils.parseEther('100'));
  });

  it('Should issue a loan to user1', async function () {
    await loanManager
      .connect(user1)
      .issueLoan(1, ethers.utils.parseEther('50'));
    const loan = await loanManager.loans(1);
    expect(loan.borrower).to.equal(user1.address);
    expect(loan.amount).to.equal(ethers.utils.parseEther('50'));
  });

  it('Should allow user1 to repay the loan', async function () {
    await mockUSDT
      .connect(user1)
      .approve(loanManager.address, ethers.utils.parseEther('55'));
    await loanManager.connect(user1).repayLoan(1);
    const loan = await loanManager.loans(1);
    expect(loan.isActive).to.equal(false);
  });

  it('Should trigger liquidation when collateral falls below threshold', async function () {
    await mockUSDT
      .connect(user2)
      .approve(liquidationManager.address, ethers.utils.parseEther('80'));
    await liquidationManager.connect(user2).liquidate(1);
    const collateral = await nftVault.collaterals(1);
    expect(collateral.isActive).to.equal(false);
  });
});

it('Should allow user1 to approve and user2 to spend USDT', async function () {
  await mockUSDT
    .connect(user1)
    .approve(user2.address, ethers.utils.parseEther('100'));
  const allowance = await mockUSDT.allowance(user1.address, user2.address);
  expect(allowance).to.equal(ethers.utils.parseEther('100'));
});

it('Should allow user2 to transferFrom user1’s balance', async function () {
  await mockUSDT
    .connect(user1)
    .approve(user2.address, ethers.utils.parseEther('50'));
  await mockUSDT
    .connect(user2)
    .transferFrom(user1.address, user2.address, ethers.utils.parseEther('50'));

  const balance1 = await mockUSDT.balanceOf(user1.address);
  const balance2 = await mockUSDT.balanceOf(user2.address);

  expect(balance1).to.equal(ethers.utils.parseEther('950'));
  expect(balance2).to.equal(ethers.utils.parseEther('50'));
});
