const {ethers} = require("hardhat");

async function main(){
    const DAO = await ethers.getContractFactory("DAO");

    const initialSupply = ethers.utils.parseUnits("1000000",18);
    const dao = await DAO.deploy(initialSupply);
    await dao.deployed();
    console.log("Deployed to:",dao.address);
}

main()
.then(()=>process.exit(0))
.catch((error)=>{
    console.error(error);
    process.exit(1);
});