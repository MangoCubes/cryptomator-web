# cryptomator-web (UNOFFICIAL)
Access Cryptomator vault without installing a program on your PC. Useful if you are on a rush, or cannot install programs for whatever reason.

**It is strongly recommended that you do not use this as your primary vault access method. This is just an implementation of Cryptomator based on its security architecture in browser, and therefore should be considered as a trade-off between usability and security. Please do not use it for mission-critical stuff.**

## Try it now

[Click here](https://mangocubes.github.io/cryptomator-web/).

## To-dos
 - [x] Read normal files
 - [x] Read vault contents
 - [x] Download normal files
 - [x] Decrypt and download encrypted files
 - [x] Download multiple files
 - [x] Basic directory manager
 - [x] Create vault
 - [x] Upload files into normal FS and Cryptomator FS
 - [x] Move files around in both FS

Please suggest a feature to implement via issue tracker.

## Supported protocols/providers
 - [x] WebDAV
 - [ ] Google Drive
 - [ ] S3
 - [ ] Dropbox

Please suggest a provider via issue tracker. I will try my best to implement them.

## FAQ (At least what I expect to be one)
### Cannot use with Nextcloud instance despite correct username and password
You most likely have not allowed the public instance (or your own instance) to query your Nextcloud server. For now, it seems that you need administrative access to your server. If you do, do the following to allow the browser to access your server:

1. Log into your Nextcloud server.
2. Install the following app: [WebAppPassword](https://apps.nextcloud.com/apps/webapppassword).
3. Go to settings, and locate WebAppPassword. It should be under Administration section.
4. Add the Cryptomator-web domain to the Allowed origins. If you are using public instance, you would add `https://mangocubes.github.io`.
5. Click "Set origins", and try again.