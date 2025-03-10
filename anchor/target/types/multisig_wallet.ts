/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/multisig_wallet.json`.
 */
export type MultisigWallet = {
  "address": "2gpw374gkM18X1dJiuaF7KkufdkPV23GboDeJ11PgT4h",
  "metadata": {
    "name": "multisigWallet",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addCustodian",
      "discriminator": [
        173,
        133,
        165,
        124,
        100,
        133,
        110,
        203
      ],
      "accounts": [
        {
          "name": "multisig",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "multisig"
          ]
        }
      ],
      "args": [
        {
          "name": "newCustodian",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "approveProposal",
      "discriminator": [
        136,
        108,
        102,
        85,
        98,
        114,
        7,
        147
      ],
      "accounts": [
        {
          "name": "approver",
          "writable": true,
          "signer": true
        },
        {
          "name": "multisigAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  115,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "multisig_account.owner",
                "account": "multisigAccountState"
              },
              {
                "kind": "account",
                "path": "multisig_account.unique_name",
                "account": "multisigAccountState"
              }
            ]
          }
        },
        {
          "name": "transactionAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "multisigAccount"
              },
              {
                "kind": "account",
                "path": "transaction_account.unique_proposal_name",
                "account": "transactionAccountState"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "changeThreshold",
      "discriminator": [
        146,
        151,
        213,
        63,
        121,
        79,
        9,
        29
      ],
      "accounts": [
        {
          "name": "multisig",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "multisig"
          ]
        }
      ],
      "args": [
        {
          "name": "newThreshold",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createMultisigWallet",
      "discriminator": [
        175,
        69,
        3,
        194,
        93,
        60,
        54,
        244
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "multisigAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  115,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "uniqueName"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "custodians",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "threshold",
          "type": "u8"
        },
        {
          "name": "uniqueName",
          "type": "string"
        },
        {
          "name": "timeLockDuration",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createProposal",
      "discriminator": [
        132,
        116,
        68,
        174,
        216,
        160,
        198,
        22
      ],
      "accounts": [
        {
          "name": "proposer",
          "writable": true,
          "signer": true
        },
        {
          "name": "multisigAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  115,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "multisig_account.owner",
                "account": "multisigAccountState"
              },
              {
                "kind": "account",
                "path": "multisig_account.unique_name",
                "account": "multisigAccountState"
              }
            ]
          }
        },
        {
          "name": "transactionAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "multisigAccount"
              },
              {
                "kind": "arg",
                "path": "uniqueProposalName"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "uniqueProposalName",
          "type": "string"
        },
        {
          "name": "programId",
          "type": "pubkey"
        },
        {
          "name": "accounts",
          "type": {
            "vec": {
              "defined": {
                "name": "transactionAccount"
              }
            }
          }
        },
        {
          "name": "data",
          "type": "bytes"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "executeTransaction",
      "discriminator": [
        231,
        173,
        49,
        91,
        235,
        24,
        68,
        19
      ],
      "accounts": [
        {
          "name": "executor",
          "signer": true
        },
        {
          "name": "multisigAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  115,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "multisig_account.owner",
                "account": "multisigAccountState"
              },
              {
                "kind": "account",
                "path": "multisig_account.unique_name",
                "account": "multisigAccountState"
              }
            ]
          }
        },
        {
          "name": "transactionAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "multisigAccount"
              },
              {
                "kind": "account",
                "path": "transaction_account.unique_proposal_name",
                "account": "transactionAccountState"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "removeCustodian",
      "discriminator": [
        249,
        107,
        34,
        152,
        33,
        98,
        180,
        14
      ],
      "accounts": [
        {
          "name": "multisig",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "multisig"
          ]
        }
      ],
      "args": [
        {
          "name": "custodian",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setTimeLockDuration",
      "discriminator": [
        57,
        166,
        102,
        139,
        83,
        253,
        128,
        224
      ],
      "accounts": [
        {
          "name": "multisig",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "multisig"
          ]
        }
      ],
      "args": [
        {
          "name": "newDuration",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "multisigAccountState",
      "discriminator": [
        48,
        44,
        9,
        177,
        131,
        67,
        131,
        57
      ]
    },
    {
      "name": "transactionAccountState",
      "discriminator": [
        52,
        185,
        218,
        171,
        43,
        51,
        53,
        45
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "noCustodian",
      "msg": "No custodian provided !"
    },
    {
      "code": 6001,
      "name": "tooManyCustodians",
      "msg": "Maximum 5 custodians allowed !"
    },
    {
      "code": 6002,
      "name": "noThreshold",
      "msg": "Threshold cannot be zero !"
    },
    {
      "code": 6003,
      "name": "invalidThreshold",
      "msg": "Threshold value exceeds custodian length !"
    },
    {
      "code": 6004,
      "name": "unAuthorizedToPropose",
      "msg": "Only custodians can propose !"
    },
    {
      "code": 6005,
      "name": "tooManyAccounts",
      "msg": "Accounts cannot exceed max length 10"
    },
    {
      "code": 6006,
      "name": "duplicateCustodian",
      "msg": "Duplicate custodian not allowed !"
    },
    {
      "code": 6007,
      "name": "unAuthorizedApprover",
      "msg": "You are not a custodian !"
    },
    {
      "code": 6008,
      "name": "unAuthorizedExecutor",
      "msg": "You are not proposer of this transaction !"
    },
    {
      "code": 6009,
      "name": "timeLockNotExpired",
      "msg": "Expiry time hans't reached !"
    },
    {
      "code": 6010,
      "name": "transactionNotFound",
      "msg": "Transaction not found !"
    },
    {
      "code": 6011,
      "name": "transactionExecuted",
      "msg": "Transaction already executed !"
    },
    {
      "code": 6012,
      "name": "notEnoughApprover",
      "msg": "Not Enough approver !"
    },
    {
      "code": 6013,
      "name": "duplicateCustodianApproval",
      "msg": "You have already approved this proposal"
    },
    {
      "code": 6014,
      "name": "accountMismatch",
      "msg": "Provided accounts doesn't match !"
    },
    {
      "code": 6015,
      "name": "custodianAlreadyExists",
      "msg": "Custodian already exists"
    },
    {
      "code": 6016,
      "name": "custodianNotFound",
      "msg": "Custodian not found"
    },
    {
      "code": 6017,
      "name": "missingSigner",
      "msg": "Signer is Missing !"
    },
    {
      "code": 6018,
      "name": "invalidTransferAccounts",
      "msg": "Transfer Accounts are invalid "
    },
    {
      "code": 6019,
      "name": "invalidDataLength",
      "msg": "Invalid data length for transaction account slicing "
    }
  ],
  "types": [
    {
      "name": "multisigAccountState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uniqueName",
            "type": "string"
          },
          {
            "name": "custodians",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "threshold",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "proposalCount",
            "type": "u64"
          },
          {
            "name": "timeLockDuration",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "transactionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "pubkey"
          },
          {
            "name": "isSigner",
            "type": "bool"
          },
          {
            "name": "isWritable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "transactionAccountState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uniqueProposalName",
            "type": "string"
          },
          {
            "name": "programId",
            "type": "pubkey"
          },
          {
            "name": "accounts",
            "type": {
              "vec": {
                "defined": {
                  "name": "transactionAccount"
                }
              }
            }
          },
          {
            "name": "data",
            "type": "bytes"
          },
          {
            "name": "signers",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "isExecuted",
            "type": "bool"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "multisig",
            "type": "pubkey"
          },
          {
            "name": "timeLockExpiry",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
