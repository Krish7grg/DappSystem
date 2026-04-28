import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMilestoneFunding: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying MilestoneFunding with account:", deployer);

  const goal = hre.ethers.parseEther("1");
  const durationInDays = 7;

  const descriptions = [
    "Prototype development",
    "Testing phase",
    "Final deployment",
  ];

  const amounts = [
    hre.ethers.parseEther("0.3"),
    hre.ethers.parseEther("0.3"),
    hre.ethers.parseEther("0.4"),
  ];

  await deploy("MilestoneFunding", {
    from: deployer,
    args: [goal, durationInDays, descriptions, amounts],
    log: true,
    autoMine: true,
  });

  console.log("✅ MilestoneFunding deployed successfully");
};

export default deployMilestoneFunding;

deployMilestoneFunding.tags = ["MilestoneFunding"];