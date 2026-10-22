# StratoshiVibes Mahjong

Mahjong solitaire with the StratoshiVibes Vol.1 Degens characters. Free to play, no wallet connection, no tokens or rewards.

- Play in the browser: https://stratanen.github.io/stratoshivibes-mahjong/
- Privacy policy: https://stratanen.github.io/stratoshivibes-mahjong/privacy.html

## Build the Android APK

The APK is a Solana Mobile web shell around the hosted game, built by GitHub Actions.

1. Actions → **Build Android APK** → Run workflow.
2. Raise **version_code** by 1 for every new release (1, 2, 3 …).
3. Download the APK from the finished run's Artifacts.

The release signing key is stored encrypted as `release.keystore.enc`. The workflow decrypts it with the `KEYSTORE_PASSWORD` repository secret. Every future update must be signed with this same key, so keep a backup of the keystore and its password outside GitHub.
