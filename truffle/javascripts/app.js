var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var services = {};
for (var i = 0; i < contractLocations.length; i++) {
    var contract = web3.eth.contract(JSON.parse(contractLocations[i]['abi'])).at(contractLocations[i]['address']);
    services[contractLocations[i].name] = contract;
}


// MetaCoin is our usable abstraction, which we'll use through the code below.
var FlexBudgetContract = services['FlexBudgetContract'];
var PurchaseContract = services['PurchaseContract'];

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalance();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    var meta = FlexBudgetContract;

    return meta.getBalance.call(account, {from: account}, function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value ? value.valueOf() : 0;
    });
    //     .catch(function(e) {
    //   console.log(e);
    //   self.setStatus("Error getting balance; see log.");
    // });
  },

  deposit: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var meta = FlexBudgetContract;

    return meta.deposit(receiver, amount, {from: account}, function () {
        self.setStatus("Transaction complete!");
        self.refreshBalance();
    });
  //       .catch(function(e) {
  //   console.log(e);
  //   self.setStatus("Error sending coin; see log.");
  // });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});