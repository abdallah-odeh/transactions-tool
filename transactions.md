| Transaction                                           | Messages                   | Source                          | Status | Details 
|-------------------------------------------------------|----------------------------|---------------------------------|--------|---------
| Domestic Auth                                         | Auth                       | Webhook                         |   ✅   |   
| Domestic Auth Reversal                                | Auth Reversal              | Webhook                         |   ✅   |   
| International Auth Reversal                           | Auth Reversal              | Webhook                         |   ✅   | Amount + Fees 
| Domestic ATM withdrawal                               | Auth + Settlement          | Webhook + Sync File             |   ✅   | (Amount + Fees + Fee VAT in same message) + Amount, Withdrawal  Commission, Withdrawal  Commission VAT each in separate record
| Domestic ATM withdrawal Refund                        | Auth + Settlement + Refund | Webhook + Sync File + Sync File |   ✅   | Webhook + Sync File
| Domestic ATM withdrawal (Direct Settlement)           | Settlement                 | Webhook + Sync File             |        | Amount + Fees + Fee VAT in same message
| Domestic ATM withdrawal Reversal (Direct Settlement)  | Settlement                 | Webhook                         |        | Amount + Fees + Fee VAT in same message
| International ATM Withdrawal                          | Auth + Settlement          | Webhook + Sync File             |   ✅   | (Amount + Fees + Fee VAT in same message) + Amount, Withdrawal  Commission, Withdrawal  Commission VAT each in separate record
| International ATM Withdrawal Reversal                 | Auth + Settlement          | Webhook + Sync File             |        | (Amount + Fees + Fee VAT in same message) + Amount, Withdrawal  Commission, Withdrawal  Commission VAT each in separate record
| Domestic Purchase                                     | Auth + Settlement          | Webhook + Sync File             |   ✅   |
| Domestic Purchase Partial Refund                      | Settlement                 | Sync File                       |   ✅   |
| Domestic Purchase Full Refund                         | Settlement                 | Sync File                       |   ✅   |
| International Purchase (FX commession)                | Auth + Settlement          | Webhook + Sync File             |   ✅   | (Amount + Fees + Fee VAT in same message) + Amount, Withdrawal  Commission, Withdrawal  Commission VAT each in separate record
| International Purchase Partial Refund (FX commission) | Settlement                 | Sync File                       |   ✅   | Amount, FX commission each in separate record
| International Purchase Full Refund (FX commission)    | Settlement                 | Sync File                       |   ✅   | Amount, FX commission each in separate record