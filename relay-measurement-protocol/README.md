# relay-measurement-protocol
A Google Cloud Function to relay measurement protocol hits

## Instructions
1. Download this folder to your development machine
1. Modify the 3 constants for your needs:
  1. `ALLOW_ORIGINS`
  1. `MP_DEFAULT_DH`
  1. `MP_DEFAULT_DP`
1. Deploy the cloud function: `gcloud beta functions deploy relayMPHit --trigger-http`
