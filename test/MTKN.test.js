// Load dependencies
const testHelpers = require("@openzeppelin/test-helpers");

// Load Compiled atifacts
const MTKN = artifacts.require("MTKN");

//Test Block
contract("MTKN", (accounts) => {
  let mtkn = null;
  const [deployer, receiver, anotherAccount] = accounts;

  //Helper function to easily convert tokens toWei
  function convert(n) {
    return web3.utils.toWei(n, "ether");
  }

  beforeEach(async () => {
    //store MTKN deployed instance to mtkn variable
    mtkn = await MTKN.new("Mock Token", "MTKN", 18, 100000);
  });

  //Test Cases
  it("deploy - Should deploy correctly", () => {
    assert.notStrictEqual(mtkn.address, "");
  });

  it("name - Should have name", async () => {
    const name = await mtkn.name();
    assert.strictEqual(name, "Mock Token");
  });

  it("symbol - Should have symbol", async () => {
    const symbol = await mtkn.symbol();
    assert.strictEqual(symbol, "MTKN");
  });

  it("decimals - Should have decimals", async () => {
    const decimals = await mtkn.decimals();
    const result = decimals.toString();
    assert.strictEqual(result, "18");
  });

  it("totalSupply - Should have totalSupply", async () => {
    const totalSupply = await mtkn.totalSupply();
    const result = totalSupply.toString();
    assert.strictEqual(result, convert("100000"));
  });

  it("balanceOf - Should ensure initial balance of deployer is 100K tokens", async () => {
    const balance = await mtkn.balanceOf(deployer);
    const result = balance.toString();
    assert.strictEqual(result, convert("100000"));
  });

  it("balanceOf - Should ensure initial balances other than deployer are zero", async () => {
    const balance = await mtkn.balanceOf(receiver);
    const result = balance.toString();
    assert.strictEqual(result, convert("0"));
  });

  it("transfer - Should revert in case of insufficient tokens during token transfers", async () => {
    await testHelpers.expectRevert(
      mtkn.transfer(anotherAccount, convert("1000"), {
        from: receiver,
      }),
      "Not enough tokens"
    );
  });

  it("transfer - Should revert when transfering tokens to zero address", async () => {
    await testHelpers.expectRevert(
      mtkn.transfer(testHelpers.constants.ZERO_ADDRESS, convert("1000"), {
        from: deployer,
      }),
      "Transfer of tokens to zero address is not allowed"
    );
  });

  it("transfer - Should update balance of sender and receiver on successful transfer", async () => {
    await mtkn.transfer(receiver, convert("5000"));
    const balance1 = await mtkn.balanceOf(receiver);
    const result1 = balance1.toString();
    assert.strictEqual(result1, convert("5000"));

    const balance2 = await mtkn.balanceOf(deployer);
    const result2 = balance2.toString();
    assert.strictEqual(result2, convert("95000"));
  });

  it("transfer - Should emit a Transfer event on successful transfer", async () => {
    const receipt = await mtkn.transfer(anotherAccount, convert("1000"));

    testHelpers.expectEvent(receipt, "Transfer", {
      _from: deployer,
      _to: anotherAccount,
      _value: convert("1000"),
    });
  });

  it("transfer - Should ensure transfer of 0 value is also treated as normal transfer and emits a Transfer event", async () => {
    const receipt = await mtkn.transfer(accounts[3], convert("0"));

    testHelpers.expectEvent(receipt, "Transfer", {
      _from: deployer,
      _to: accounts[3],
      _value: convert("0"),
    });
  });

  it("approve - Should revert when owner and spender are same address", async () => {
    await testHelpers.expectRevert(
      mtkn.approve(deployer, convert("1000"), { from: deployer }),
      "_spender and _owner cannot be a same address"
    );
  });

  it("approve - Should revert when spender is zero address", async () => {
    await testHelpers.expectRevert(
      mtkn.approve(testHelpers.constants.ZERO_ADDRESS, convert("1000"), {
        from: deployer,
      }),
      "Approval of tokens to zero address is not allowed"
    );
  });

  it("approve - Should update allowance", async () => {
    await mtkn.approve(accounts[3], convert("2000"), { from: deployer });
    const allowance = await mtkn.allowance(deployer, accounts[3]);
    const result = allowance.toString();

    assert.strictEqual(result, convert("2000"));
  });

  it("approve - Should emit an Approval event on successful approval", async () => {
    const result = await mtkn.approve(anotherAccount, convert("1000"), {
      from: deployer,
    });

    testHelpers.expectEvent(result, "Approval", {
      _owner: deployer,
      _spender: anotherAccount,
      _value: convert("1000"),
    });
  });

  it("approve - Should ensure it overwrites the current allowance when a approve function is called again", async () => {
    await mtkn.approve(accounts[3], convert("2000"), { from: deployer });
    const allowance1 = await mtkn.allowance(deployer, accounts[3]);
    const result1 = allowance1.toString();
    assert.strictEqual(result1, convert("2000"));

    await mtkn.approve(accounts[3], convert("1000"), { from: deployer });
    const allowance2 = await mtkn.allowance(deployer, accounts[3]);
    const result2 = allowance2.toString();
    assert.strictEqual(result2, convert("1000"));
  });

  it("transferFrom - Should revert in case of insufficient allowance", async () => {
    await testHelpers.expectRevert(
      mtkn.transferFrom(deployer, accounts[3], convert("500"), {
        from: accounts[3],
      }),
      "Not enough allowance"
    );
  });

  it("transferFrom - Should update an allowance of a spender on successful transfer", async () => {
    await mtkn.approve(anotherAccount, convert("2000"), { from: deployer });

    await mtkn.transferFrom(deployer, anotherAccount, convert("750"), {
      from: anotherAccount,
    });

    const allowance = await mtkn.allowance(deployer, anotherAccount, {
      from: anotherAccount,
    });
    const result = allowance.toString();

    assert.strictEqual(result, convert("1250"));
  });

  it("transferFrom - Should revert in case of insufficient tokens in owner account", async () => {
    await mtkn.approve(anotherAccount, convert("2000"), { from: receiver });

    await testHelpers.expectRevert(
      mtkn.transferFrom(receiver, anotherAccount, 1000, {
        from: anotherAccount,
      }),
      "Not enough tokens"
    );
  });

  it("transferFrom - Should revert when transfering tokens to zero address", async () => {
    await mtkn.approve(anotherAccount, convert("1000"), { from: deployer });

    await testHelpers.expectRevert(
      mtkn.transferFrom(
        deployer,
        testHelpers.constants.ZERO_ADDRESS,
        convert("1000"),
        { from: anotherAccount }
      ),
      "Transfer of tokens to zero address is not allowed"
    );
  });

  it("transferFrom - Should update balance of a sender and receiver on Successful transferFrom", async () => {
    await mtkn.approve(receiver, convert("1000"), { from: deployer });

    await mtkn.transferFrom(deployer, receiver, convert("1000"), {
      from: receiver,
    });

    const senderBalance = await mtkn.balanceOf(deployer);
    const result1 = senderBalance.toString();
    const receiverBalance = await mtkn.balanceOf(receiver);
    const result2 = receiverBalance.toString();

    assert.strictEqual(result1, convert("99000"));
    assert.strictEqual(result2, convert("1000"));
  });

  it("transferFrom - Should emit a Transfer event on successful transferFrom", async () => {
    await mtkn.approve(receiver, convert("1000"), { from: deployer });

    const receipt = await mtkn.transferFrom(
      deployer,
      receiver,
      convert("1000"),
      {
        from: receiver,
      }
    );

    testHelpers.expectEvent(receipt, "Transfer", {
      _from: deployer,
      _to: receiver,
      _value: convert("1000"),
    });
  });
});
