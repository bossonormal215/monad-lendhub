const { ethers } = require('hardhat');
const { getContract } = require('./helper');

async function main() {
  const contract = await getContract();
  const [signer] = await ethers.getSigners(); // Get the signer (your account)

  // Get contract state
  const totalSupply = await contract.totalSupply();
  console.log(`Total Supply: ${totalSupply}`);

  // Get contract balance
  const balance = await ethers.provider.getBalance(contract.getAddress());
  console.log(`Contract Balance: ${ethers.formatEther(balance)} ETH`);

  // Addresses to transfer to
  const recipients = [
    '0x65b372e0793B3B0fAF9F9F83E0FE84A18fc92419',
    '0x87bcd6fc748a1BE99598b18183627a8c86804aAB',
  ];

  const amount = 20000; // Amount to transfer to each recipient

  // transfer
  // const gmonadTokenConnected = contract.connect(deployer); // Connect with the deployer as signer
  const decimals = await contract.decimals();

  try {
    for (const recipient of recipients) {
      const amountInWei = ethers.parseUnits(amount.toString(), decimals);
      const tx = await contract.transfer(recipient, amountInWei);
      await tx.wait();
      console.log(
        `Transferred ${amount} tokens to ${recipient}. Transaction hash: ${tx.hash}`
      );
    }
  } catch (error) {
    console.error('Error during transfer:', error);
  }

  //   const tx = await contract.transfer(recipients, amount)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
