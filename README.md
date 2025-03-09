### Solana Multisig Wallet

The Solana Multisig Wallet is an Anchor-based smart contract designed to enable secure group fund management on the Solana blockchain. This program allows a predefined set of custodians to collectively manage funds via proposals, approvals, and executions. Transactions can only be executed once the required number of custodians have approved and any timelock period has expired.

### Deployment

This full stack project is deployed at ();

## Functionality

In this project, a group of custodians (trusted individuals) can jointly manage a wallet by following a three-step process:

Proposal Creation:
A custodian creates a proposal that specifies the details of a transaction (e.g. transferring SOL or tokens). The proposal includes a unique name, a target program to call (e.g., the System Program for SOL transfers), a list of involved accounts, an encoded instruction , and a description. A timelock is set to allow custodians to review the proposal.

Approval:
Other custodians review the proposal and approve it by adding their signature. Each approval is recorded to ensure that the proposal reaches the required threshold.

Execution:
Once the proposal has received enough approvals and the timelock period has expired, the designated executor (in this implementation, the proposer) can execute the transaction. The program then verifies all details and invokes the target program using the stored instruction data.

Additionally, the wallet supports modifying its state, such as adding or removing custodians, adjusting the approval threshold, and changing the timelock duration.
