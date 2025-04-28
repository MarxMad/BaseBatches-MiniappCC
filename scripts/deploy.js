const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Desplegando contratos con la cuenta:", deployer.address);

  const CampusCoin = await hre.ethers.getContractFactory("CampusCoin");
  const campusCoin = await CampusCoin.deploy();

  await campusCoin.deployed();

  console.log("CampusCoin desplegado en:", campusCoin.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 