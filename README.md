# Node-RED node to convert HomeKit Light Accessory's HSB values to RGB values

Useful with: node-red-contrib-homekit | node-red-contrib-homekit-bridged

## Expected input

Output of [HomeKit light accessory](https://nrchkb.github.io/wiki/service/lightbulb/). Any of the following:

* *msg.payload.Hue* **{float}** `0.0` to `360.0`
* *msg.payload.Saturation* **{float}** `0.0` to `100.0`
* *msg.payload.Brightness* **{int}** `0` to `100`
* *msg.payload.ColorTemperature* **{int}** `140` to `500`
* *msg.payload.On* **{bool}** `true`|`false`

## Output

The original input message (pass-though), plus following additional data:

* *msg.payload.r* **{int}** `0` to `255`
* *msg.payload.g* **{int}** `0` to `255`
* *msg.payload.b* **{int}** `0` to `255`
