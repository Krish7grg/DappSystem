import { expect } from "chai";
import { ethers } from "hardhat";
import { MilestoneFunding } from "../typechain-types";

describe("MilestoneFunding", function () {
  async function deployFixture() {
    const [owner, contributor1, contributor2, otherUser] = await ethers.getSigners();

    const descriptions = [
      "Prototype development",
      "Testing phase",
      "Final deployment",
    ];

    const amounts = [
      ethers.parseEther("0.3"),
      ethers.parseEther("0.3"),
      ethers.parseEther("0.4"),
    ];

    const MilestoneFundingFactory = await ethers.getContractFactory("MilestoneFunding");
    const contract = (await MilestoneFundingFactory.deploy(
      ethers.parseEther("1"),
      7,
      descriptions,
      amounts,
    )) as MilestoneFunding;

    await contract.waitForDeployment();

    return { contract, owner, contributor1, contributor2, otherUser };
  }

  it("should deploy with correct initial values", async function () {
    const { contract, owner } = await deployFixture();

    expect(await contract.owner()).to.equal(owner.address);
    expect(await contract.goal()).to.equal(ethers.parseEther("1"));
    expect(await contract.totalFunds()).to.equal(0n);
    expect(await contract.goalReached()).to.equal(false);
    expect(await contract.campaignClosed()).to.equal(false);
    expect(await contract.currentMilestone()).to.equal(0n);
  });

  it("should accept contributions", async function () {
    const { contract, contributor1 } = await deployFixture();

    await contract.connect(contributor1).contribute({
      value: ethers.parseEther("0.5"),
    });

    expect(await contract.totalFunds()).to.equal(ethers.parseEther("0.5"));
    expect(await contract.contributions(contributor1.address)).to.equal(ethers.parseEther("0.5"));
  });

  it("should mark goal reached at 1 ETH", async function () {
    const { contract, contributor1, contributor2 } = await deployFixture();

    await contract.connect(contributor1).contribute({
      value: ethers.parseEther("0.6"),
    });

    await contract.connect(contributor2).contribute({
      value: ethers.parseEther("0.4"),
    });

    expect(await contract.goalReached()).to.equal(true);
    expect(await contract.totalFunds()).to.equal(ethers.parseEther("1"));
  });

  it("only owner should start milestone voting", async function () {
    const { contract, owner, contributor1, contributor2 } = await deployFixture();

    await contract.connect(contributor1).contribute({
      value: ethers.parseEther("0.6"),
    });

    await contract.connect(contributor2).contribute({
      value: ethers.parseEther("0.4"),
    });

    await expect(
      contract.connect(contributor1).startMilestoneVoting(0),
    ).to.be.revertedWith("Only owner can call this");

    await contract.connect(owner).startMilestoneVoting(0);

    const milestone = await contract.getMilestone(0);
    expect(milestone.votingOpen).to.equal(true);
  });

  it("contributors should vote, finalize, and release payment", async function () {
    const { contract, owner, contributor1, contributor2 } = await deployFixture();

    await contract.connect(contributor1).contribute({
      value: ethers.parseEther("0.6"),
    });

    await contract.connect(contributor2).contribute({
      value: ethers.parseEther("0.4"),
    });

    await contract.connect(owner).startMilestoneVoting(0);

    await contract.connect(contributor1).voteOnMilestone(0, true);
    await contract.connect(contributor2).voteOnMilestone(0, true);

    await contract.connect(owner).finalizeMilestoneVote(0);
    await contract.connect(owner).releaseMilestonePayment(0);

    const milestone = await contract.getMilestone(0);
    expect(milestone.paid).to.equal(true);
    expect(await contract.currentMilestone()).to.equal(1n);
  });
});