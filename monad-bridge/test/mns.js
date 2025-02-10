const { expect } = require('chai');
const { ethers } = require('hardhat');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');

describe('MonadNameService', function () {
  let mns;
  let owner, addr1, addr2;
  // Use the fee defined in the contract (0.01 ether)
  const REGISTRATION_FEE = ethers.parseEther('0.01');
  // 365 days in seconds as BigInt for arithmetic
  const NAME_EXPIRATION = BigInt(365 * 24 * 60 * 60);
  const testName = 'onorm'; // use a short name; the UI/app will append .mon

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const MNSFactory = await ethers.getContractFactory('MonadNameService');
    mns = await MNSFactory.deploy();
    await mns.waitForDeployment();
  });

  it('Should register a new name', async function () {
    // addr1 registers a name by sending the correct fee.
    const tx = await mns
      .connect(addr1)
      .registerName(testName, { value: REGISTRATION_FEE });

    // Expect the NameRegistered event to be emitted with the correct parameters.
    await expect(tx)
      .to.emit(mns, 'NameRegistered')
      .withArgs(testName, addr1.address, anyValue); // expiration is dynamic

    // Verify that the contract resolves the name to addr1.
    const resolved = await mns.resolveName(testName);
    expect(resolved).to.equal(addr1.address);

    // Compute the NFT tokenId as BigInt using keccak256 and toUtf8Bytes.
    const tokenId = BigInt(ethers.keccak256(ethers.toUtf8Bytes(testName)));
    const nftOwner = await mns.ownerOf(tokenId);
    expect(nftOwner).to.equal(addr1.address);
  });

  it('Should not allow registration with insufficient fee', async function () {
    await expect(
      mns
        .connect(addr1)
        .registerName(testName, { value: ethers.parseEther('0.005') })
    ).to.be.revertedWith('Insufficient fee');
  });

  it('Should not allow registering an already taken name', async function () {
    // addr1 registers the name.
    await mns
      .connect(addr1)
      .registerName(testName, { value: REGISTRATION_FEE });
    // addr2 attempts to register the same name while it is still valid.
    await expect(
      mns.connect(addr2).registerName(testName, { value: REGISTRATION_FEE })
    ).to.be.revertedWith('Name already taken');
  });

  it('Should allow renewal by the owner', async function () {
    // addr1 registers the name.
    const tx = await mns
      .connect(addr1)
      .registerName(testName, { value: REGISTRATION_FEE });
    const receipt = await tx.wait();

    // Retrieve the original expiration from the NameRegistered event.
    let event;
    for (const log of receipt.logs) {
      try {
        const parsedLog = mns.interface.parseLog(log);
        if (parsedLog.name === 'NameRegistered') {
          event = parsedLog;
          break;
        }
      } catch (e) {
        // Skip logs that do not match our event.
      }
    }
    expect(event, 'NameRegistered event not found').to.not.be.undefined;
    // Convert the original expiration to BigInt.
    const originalExpiration = BigInt(event.args.expiration.toString());

    // addr1 renews the name.
    const txRenew = await mns
      .connect(addr1)
      .renewName(testName, { value: REGISTRATION_FEE });
    await expect(txRenew)
      .to.emit(mns, 'NameRenewed')
      .withArgs(testName, anyValue);

    // Verify that the expiration has increased by the registration period.
    const nameRecord = await mns.names(testName);
    const newExpiration = BigInt(nameRecord.expiration.toString());
    expect(newExpiration).to.equal(originalExpiration + NAME_EXPIRATION);
  });

  it('Should not allow renewal by a non-owner', async function () {
    await mns
      .connect(addr1)
      .registerName(testName, { value: REGISTRATION_FEE });
    await expect(
      mns.connect(addr2).renewName(testName, { value: REGISTRATION_FEE })
    ).to.be.revertedWith('Not the owner');
  });

  it('Should allow transferring the name to another address', async function () {
    // addr1 registers the name.
    await mns
      .connect(addr1)
      .registerName(testName, { value: REGISTRATION_FEE });
    // Compute the NFT tokenId.
    const tokenId = BigInt(ethers.keccak256(ethers.toUtf8Bytes(testName)));

    // addr1 transfers the name to addr2.
    const txTransfer = await mns
      .connect(addr1)
      .transferName(testName, addr2.address);
    await expect(txTransfer)
      .to.emit(mns, 'NameTransferred')
      .withArgs(testName, addr2.address);

    // Verify that resolveName now returns addr2.
    const resolved = await mns.resolveName(testName);
    expect(resolved).to.equal(addr2.address);

    // Verify that the NFT ownership has changed.
    const newOwnerNFT = await mns.ownerOf(tokenId);
    expect(newOwnerNFT).to.equal(addr2.address);
  });

  it('Should perform a reverse lookup (address to name)', async function () {
    await mns
      .connect(addr1)
      .registerName(testName, { value: REGISTRATION_FEE });
    const nameLookup = await mns.addressToNameLookup(addr1.address);
    expect(nameLookup).to.equal(testName);
  });

  it('Should allow the contract owner to withdraw funds', async function () {
    // Register a name to send some funds into the contract.
    await mns
      .connect(addr1)
      .registerName(testName, { value: REGISTRATION_FEE });
    // Record the owner's balance before withdrawal.
    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
    // The owner withdraws the funds.
    const txWithdraw = await mns.connect(owner).withdraw();
    const receipt = await txWithdraw.wait();
    // In ethers v6, gasUsed is a BigInt so use the multiplication operator.
    const gasCost = receipt.gasUsed * BigInt(txWithdraw.gasPrice || 0);
    // Get the owner's balance after withdrawal.
    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
    // The owner's balance should increase by roughly REGISTRATION_FEE (minus gas cost).
    expect(finalOwnerBalance).to.be.above(initialOwnerBalance);
  });
});
