/**
 * @description HSB/V to RGB and XY
 * @package node-red-contrib-homekit-rgb
 * @param {Object} RED
 * @author Christopher Aitken 2023
 */
module.exports = function(RED)
{
	function HomekitRGB(config)
	{
		RED.nodes.createNode(this, config);

		const node = this;
		const nodeContext = this.context();


		/**
		 * @description Handle incoming messages
		 * @memberof node-red-contrib-homekit-rgb
		 * @param {object} msg
		 * @return {void}
		 */
		node.on('input', function(msg)
		{
			// Load cached values or fall-back to defaults
			let hue = nodeContext.get('h') || 0;
			let sat = nodeContext.get('s') || 0;
			let bri = nodeContext.get('b') || 100;

			// Prep cache from input
			if ('Hue' in msg.payload) hue = msg.payload.Hue;
			if ('Saturation' in msg.payload) sat = msg.payload.Saturation;
			if ('Brightness' in msg.payload) bri = msg.payload.Brightness;

			// Convert from kelvin
			if ('ColorTemperature' in msg.payload)
			{
				// Conversions
				const rgb = kelvin2rgb(msg.payload.ColorTemperature);
				const hsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
				const xy = rgb2xy(rgb.r, rgb.g, rgb.b);

				// Prep output
				msg.payload.r = rgb.r;
				msg.payload.g = rgb.g;
				msg.payload.b = rgb.b;

				msg.payload.x = xy.x;
				msg.payload.y = xy.y;

				msg.payload.Hue = hsv.h;
				msg.payload.Saturation = hsv.s;
				msg.payload.Brightness = hsv.v;

				// Update cache
				nodeContext.set('h', hsv.h);
				nodeContext.set('s', hsv.s);
				nodeContext.set('b', hsv.v);
			}
			// Convert from XY
			else if (('x' in msg.payload) && ('y' in msg.payload))
			{
				// Conversions
				const rgb = xy2rgb(msg.payload.x, msg.payload.y);
				const kelvin = rgb2kelvin(rgb.r, rgb.g, rgb, rgb.b);
				const hsv = rgb2hsv(rgb.r, rgb.g, rgb.b);

				// Prep output
				msg.payload.r = rgb.r;
				msg.payload.g = rgb.g;
				msg.payload.b = rgb.b;

				msg.payload.ColorTemperature = kelvin;

				msg.payload.Hue = hsv.h;
				msg.payload.Saturation = hsv.s;
				msg.payload.Brightness = hsv.v;

				// Update cache
				nodeContext.set('h', hsv.h);
				nodeContext.set('s', hsv.s);
				nodeContext.set('b', hsv.v);
			}
			// Convert from RGB
			else if (('r' in msg.payload) && ('g' in msg.payload) && ('b' in msg.payload))
			{
				// Conversions
				const hsv = rgb2hsv(msg.payload.r, msg.payload.g, msg.payload.b);
				const xy = rgb2xy(msg.payload.r, msg.payload.g, msg.payload.b);
				const kelvin = rgb2kelvin(msg.payload.r, msg.payload.g, msg.payload.b);

				// Prep output
				msg.payload.x = xy.x;
				msg.payload.y = xy.y;

				msg.payload.Hue = hsv.h;
				msg.payload.Saturation = hsv.s;
				msg.payload.Brightness = hsv.v;

				msg.payload.ColorTemperature = kelvin;

				// Update cache
				nodeContext.set('h', hsv.h);
				nodeContext.set('s', hsv.s);
				nodeContext.set('b', hsv.v);
			}
			// Convert from HSB
			else
			{
				// Conversions
				const rgb = hsv2rgb(hue, sat, bri);
				const kelvin = rgb2kelvin(rgb.r, rgb.g, rgb, rgb.b);
				const xy = rgb2xy(rgb.r, rgb.g, rgb, rgb.b);

				// Prep output
				msg.payload.r = rgb.r;
				msg.payload.g = rgb.g;
				msg.payload.b = rgb.b;

				msg.payload.x = xy.x;
				msg.payload.y = xy.y;

				msg.payload.ColorTemperature = kelvin;

				msg.payload.Hue = hue;
				msg.payload.Saturation = sat;
				msg.payload.Brightness = bri;

				// Update cache
				nodeContext.set('h', hue);
				nodeContext.set('s', sat);
				nodeContext.set('b', bri);
			}

			node.send(msg);
		});


		/**
		 * @description Convert HSV to RGB colour values
		 * @memberof node-red-contrib-homekit-rgb
		 * @param {int} h Hue. `0` to `360`
		 * @param {int} s Saturation. `0` to `100`
		 * @param {int} v Brightness. `0` to `100`
		 * @returns {Object}:
		 *		r: {int} Red channel. `0` to `255`
		 *		g: {int} Green channel. `0` to `255`
		 * 		b: {int} Blue channel. `0` to `255`
		 */
		function hsv2rgb(h,s,v)
		{
			s /= 100;
			v /= 100;

			let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);

			return {
				r: Math.round(f(5) * 255),
				g: Math.round(f(3) * 255),
				b: Math.round(f(1) * 255)
			}
		}


		/**
		 * @description Convert RGB to HSV
		 * @memberof node-red-contrib-homekit-rgb
		 * @param {int} r Red channel. `0` to `255`
		 * @param {int} g Green channel. `0` to `255`
		 * @param {int} b Blue channel. `0` to `255`
		 * @returns {Object}
		 * 		h: {int} Hue. `0` to `360`
		 * 		s: {int} Saturation. `0` to `100`
		 * 		v: {int} Brightness. `0` to `100`
		 */
		function rgb2hsv(r, g, b)
		{
			let v = Math.max(r, g, b);
			let c = v - Math.min(r, g, b);
			let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));

			return {
				h: 60 * (h < 0 ? h + 6 : h),
				s: (v && c / v) * 100,
				v: v * 100
			}
		  }


		/**
		 * @description Return inverse gamma correction to given value
		 * @memberof node-red-contrib-homekit-rgb
		 * @param {float} val
		 * @returns {float}
		 */
		function invGammaCorrection(val)
		{
			return val <= 0.0404482362771076 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
		}


		/**
		 * @description Convert RGB to XY colour values
		 * @param {int} r Red channel. `0` to `255`
		 * @param {int} g Green channel. `0` to `255`
		 * @param {int} b Blue channel. `0` to `255`
		 * @returns {Object}:
		 *		x: {float}
		 *		y: {float}
		 */
		function rgb2xy(r, g, b)
		{
			r = invGammaCorrection(r);
			g = invGammaCorrection(g);
			b = invGammaCorrection(b);

			let x = 0.4123955889674142161 * r + 0.3575834307637148171 * g + 0.1804926473817015735 * b;
			let y = 0.2125862307855955516 * r + 0.7151703037034108499 * g + 0.07220049864333622685 * b;
			let z = 0.01929721549174694484 * r + 0.1191838645808485318 * g + 0.9504971251315797660 * b;

			return {
				x: isNaN(x / (x + y + z)) ? 0 : x / (x + y + z),
				y: isNaN(y / (x + y + z)) ? 0 : y / (x + y + z),
			};
		}


		/**
		 * @description Convert XY to RGB colour values
		 * @param {float} x X channel
		 * @param {float} y Y channel
		 * @returns {Object}:
		 *		r: {int} Red channel. `0` to `255`
		 *		g: {int} Green channel. `0` to `255`
		 *		b: {int} Blue channel. `0` to `255`
		 */
		function xy2rgb(x, y)
		{
			y = y || 0.00000000001;
			const new_y = 1;
			const new_x = (new_y / y) * x;
			const new_z = (new_y / y) * (1 - x - y);

			// Convert to RGB using Wide RGB D65 conversion.
			let rgb = [
				new_x * 1.656492 - new_y * 0.354851 - new_z * 0.255038,
				-new_x * 0.707196 + new_y * 1.655397 + new_z * 0.036152,
				new_x * 0.051713 - new_y * 0.121364 + new_z * 1.011530
			];

			// Apply reverse gamma correction.
			rgb = rgb.map(x =>
				x <= 0.0031308 ? 12.92 * x : (1.0 + 0.055) * Math.pow(x, 1.0 / 2.4) - 0.055
			);

			// Bring all negative components to zero.
			rgb = rgb.map(x => Math.max(0, x));

			// If one component is greater than 1, weight components by that value.
			const max = Math.max(rgb);
			if (max > 1) rgb = rgb.map(x => x / max);

			rgb = rgb.map(x => Math.round(x * 255));

			return {
				r: rgb[0],
				g: rgb[1],
				b: rgb[2]
			};
		}


		/**
		 * @description Converts degrees Kelvin to RGB values
		 * @param {int} kelvin
		 * @return {Object}:
		 *		r: {int} Red channel. `0` to `255`
		 *		g: {int} Green channel. `0` to `255`
		 *		b: {int} Blue channel. `0` to `255`
		 */
		function kelvin2rgb(kelvin)
		{
			let temperature = kelvin / 100.0;
			let red;
			let green;
			let blue;

			// Calculate red
			if (temperature < 66.0)
			{
				red = 255;
			}
			else
			{
				red = temperature - 55.0;
				red = 351.97690566805693+ 0.114206453784165 * red - 40.25366309332127 * Math.log(red);
				if (red < 0) red = 0;
				if (red > 255) red = 255;
			}

			// Calculate green
			if (temperature < 66.0)
			{
				green = temperature - 2;
				green = -155.25485562709179 - 0.44596950469579133 * green + 104.49216199393888 * Math.log(green);
				if (green < 0) green = 0;
				if (green > 255) green = 255;
			}
			else
			{
				green = temperature - 50.0;
				green = 325.4494125711974 + 0.07943456536662342 * green - 28.0852963507957 * Math.log(green);
				if (green < 0) green = 0;
				if (green > 255) green = 255;
			}

			// Calculate blue
			if (temperature >= 66.0)
			{
				blue = 255;
			}
			else
			{
				if (temperature <= 20.0)
				{
					blue = 0;
				}
				else
				{
					blue = temperature - 10;
					blue = -254.76935184120902 + 0.8274096064007395 * blue + 115.67994401066147 * Math.log(blue);
					if (blue < 0) blue = 0;
					if (blue > 255) blue = 255;
				}
			}

			return {
				r: Math.round(red),
				g: Math.round(green),
				b: Math.round(blue)
			};
		}


		/**
		 * @description Convert RGB to degrees kelvin
		 * @param {int} r Red channel. `0` to `255`
		 * @param {int} g Green channel. `0` to `255`
		 * @param {int} b Blue channel. `0` to `255`
		 * @returns {int} degrees kelvin.
		 */
		function rgb2kelvin(r, g, b)
		{
			let kelvin;
			let rgb;
			const epsilon = 0.4;
			let minTemperature = 1000;
			let maxTemperature = 40000;

			while (maxTemperature - minTemperature > epsilon)
			{
				kelvin = (maxTemperature + minTemperature) / 2;
				rgb = kelvin2rgb(kelvin);

				if ((rgb.b / rgb.r) >= (b / r))
				{
					maxTemperature = kelvin;
				}
				else
				{
					minTemperature = kelvin;
				}
			}

			return Math.round(kelvin);
		}
	}


	RED.nodes.registerType("homekit-rgb",HomekitRGB);
}
