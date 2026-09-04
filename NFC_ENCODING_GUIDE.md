# Tapfolio NFC Card Encoding Guide

## Hardware Requirements

- **NFC Chip**: Blank PVC NTAG215 or NTAG216 microchips
- **Frequency**: 13.56 MHz, ISO/IEC 14443 Type A
- **Memory**: NTAG215 (504 bytes user memory) or NTAG216 (888 bytes user memory)
- **Form Factor**: PVC cards or keyfobs with NTAG215/216 chip

## Target URI Format

The NFC card will contain an NDEF URI record pointing to:
```
https://<your-domain>/c/<client-slug>
```

**Example**: `https://tapfolio.app/c/Allan-kimani`

## Recommended Tools

### Option 1: NFC Tools App (iOS & Android)
1. Download "NFC Tools" by NXP from the App Store or Google Play
2. Open the app and go to "WRITE" tab
3. Tap the NFC card to the back of your phone
4. If prompted, select "NDEF URI Record"
5. Enter the URI: `https://your-domain/c/Allan-kimani`
6. Tap "Write" and confirm
7. Tap the card again to verify

### Option 2: NFC Tools CLI (Linux/Mac/Windows with Node.js)
1. Install NFC Tools CLI:
   ```bash
   npm install -g nfc-tools
   ```
2. Identify your NFC reader:
   ```bash
   nfc-list
   ```
3. Write the NDEF URI:
   ```bash
   nfc-write -E "urn:ndef:rt:Uri:0x1001<your-uri-encoded>"
   ```
   Or using the Python script approach:

### Option 3: Python Script (using nfclib)
1. Install library:
   ```bash
   pip install python-nfc
   ```
2. Write the URI:
   ```python
   import nfc
   import urllib.parse
   
   uri = "https://tapfolio.app/c/Allan-kimani"
  ndef_message = nfc.ndef.URI(uri)
   
   with nfc.ContactlessFrontend('usb') as clf:
       clf.connect(rdwr={'on-connect': lambda tag: (
           tag.ndef.write(ndef_message) or True
       )})
   ```

## Step-by-Step Using NFC Tools App

1. **Purchase NFC cards**: Buy blank NTAG215 or NTAG216 PVC cards (available on Amazon, eBay, or specialized NFC suppliers)

2. **Install NFC Tools**: Get the "NFC Tools" app from your device's app store

3. **Check card readiness**: 
   - Open NFC Tools app
   - Tap the card to your phone
   - Verify it reads as "NTAG215" or "NTAG216"
   - Ensure the card is blank (no existing NDEF data)

4. **Write the URI**:
   - Go to the "WRITE" tab in the app
   - Tap "NDEF URI Record"
   - Enter: `https://your-domain/c/jane-doe` (replace with your actual domain and slug)
   - Tap "Write"
   - When prompted, tap the NFC card to the back of your phone
   - Confirm the write operation

5. **Verify the write**:
   - Go to the "READ" tab in the app
   - Tap the card to your phone
   - It should display the URI: `https://your-domain/c/jane-doe`

6. **Test the full experience**:
   - Tap the NFC card to your iPhone (XS or newer) or NFC-enabled Android device
   - The native browser should open and display your Tapfolio portfolio
   - Click "Save Contact" to save the vCard to your address book

## iOS Specific Notes

- **iPhone XS and newer**: Support background NFC reading natively
- **iOS 13+**: No app required for NFC tag reading
- **iPhone 7/8/SE (1st gen)**: Requires app opening via Control Center
- **iPhone XS/XR and newer**: Works in background when screen is on

## Android Specific Notes

- Most modern Android devices (Android 7+) support NFC reading
- Some devices may require "Android Beam" or "NFC" to be enabled in Settings
- Pixel, Samsung Galaxy S series, and most flagship devices work out-of-the-box

## Card Capacity

The NTAG215 chip has 504 bytes of user memory, which is sufficient for:
- The NDEF URI record (~30 bytes)
- Some additional NDEF records if needed
- No need for compression or optimization for a single URI record

## Maintenance

- NFC cards can be rewritten multiple times (typically 100,000+ erase cycles)
- If you need to update the portfolio URL, simply rewrite the card with the new slug
- Store cards away from strong magnetic fields to prevent data corruption