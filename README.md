# Node-RED node to convert HomeKit Light Accessory's HSB values to RGB values

Useful with: node-red-contrib-homekit | node-red-contrib-homekit-bridged

## Expected input

Output of [HomeKit light accessory](https://nrchkb.github.io/wiki/service/lightbulb/), _any_ of the following:

* *msg.payload.Hue* **{float}** `0.0` to `360.0`
* *msg.payload.Saturation* **{float}** `0.0` to `100.0`
* *msg.payload.Brightness* **{int}** `0` to `100`
* *msg.payload.ColorTemperature* **{int}** `140` to `500`

Or, to convert from RGB, _all_ of the following:

* *msg.payload.r* **{int}** Red channel `0` to `255`
* *msg.payload.g* **{int}** Green channel `0` to `255`
* *msg.payload.b* **{int}** Blue channel `0` to `255`

Or, to convert from XY, _all_ of the following:

* *msg.payload.x* **{float}** X channel
* *msg.payload.y* **{float}** Y channel

## Output

The original input message (pass-though), plus _all of following_ conversions (rgb, hsb, xy, megakelvin)

* *msg.payload.r* **{int}** Red channel `0` to `255`
* *msg.payload.g* **{int}** Green channel `0` to `255`
* *msg.payload.b* **{int}** Blue channel `0` to `255`
* *msg.payload.x* **{float}** X channel
* *msg.payload.y* **{float}** Y channel
* *msg.payload.Hue* **{float}** Hue `0.0` to `360.0`
* *msg.payload.Saturation* **{float}** Saturation `0.0` to `100.0`
* *msg.payload.Brightness* **{int}** Brightness`0` to `100`
* *msg.payload.ColorTemperature* **{int}** Mega Kelvin `150` to `500`
