# shipstation-notification-js-puppeteer
Using puppeteer to automate resending failed noficiations from shipstation to amazon.

Username and password stored as env variables.

Looks for failed noficiations with amazon order numbers (by string length).

Should work universally with a good internet connection - for simplicity, there are hard time delays, so bad internet could cause it not to load in time and fail.

Repeats a loop resending notifications in batches of 10. When no more failed notifications exists, program ends.

#### To run:
```
node index.js
```