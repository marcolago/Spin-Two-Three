# Spin Two Three
## A Really Simple Absolutely Randomic Slot Machine Mini Library.
### Also Useful for Synchronized Carousels.

If you need a basic slot machine script wich is easy to plug and slightly customizable **Spin Two Three** is the right script for you.

### Easy to Plug

Just include `spin-two-three.js` and the dependencies at the bottom of your markup, include the `spin-two-three.css` and customize the look as you need and, at last, white down the markup as follow:

```html
	<div class="spin-two-three" id="your-unique-id">
		<div class="wheel">
			<div class="slices">
				<div class="slice">[your content 1]</div>
				<div class="slice">[…]</div>
				<div class="slice">[your content n]</div>
			</div>
			<div class="slices">
				<!-- repeat for every slot you want -->
			</div>
		</div>
	</div>
```

The `spin-two-three` class is needed to style the slot machine but you can use anything you want, just write your own CSS.
The `id` is needed to reference the element wich will become the slot machine; you can have more than a slot machine in a single page and Spin Two Three can manage any number of slots in a single slot machine.

If you need you can use the `index.html` in the project's root as a boilerplate or you can start using an example and customizing whant you need.

### Easy to Setup

In order to create a new Spin Two Three object you just have to declare a new instance using the standard Javascript syntax.

```javascript
	new SpinTwoThree(DOMElement, [control-class], [slotsDelay], [slotsSpinTime])
```
or 
```javascript
	new SpinTwoThree(DOMElement, [control-class-1, control-class-…, control-class-n], [slotsDelay], [slotsSpinTime])
```

Based on the example above all you have to do is to include a script like this after the DOM was created:

```javascript
	var element = document.getElementById("your-unique-id"); // gets the container for the slot machine
	var instance = new SpinTwoThree(element, "spin-a");
```

In this example you are creating a new instance of the slot machine which responds to controls with class `spin-a`.
More on the control classes in the next paragraph.

### slotsDelay and slotsSpinTime Parameters

The `slotsDelay` and `slotsSpinTime` are optional parameters you can use to customize the slots’ spin time and the delay between slots full stop.

`slotsDelay` sets the time between the full stop of a wheel and the following ones in milliseconds.
If you set `slotsDelay` to `1000` the second wheel will stop about a second after the first one, the third wheel will stop about a second after the second one, an so on.
The default value is `NaN` (it means that there is not fixed delay between wheels).

`slotsSpinTime` sets the minimum time for a wheel to reach the maximum speed before it starts to slow down, in milliseconds.
If you set `slotsSpinTime` to `2000` every wheel will reach the maximum rotation speed in about 2 seconds, then will start to slow down after the proper `slotsDelay` time.
The default value is `1000`.

I said “about” because the times are a little randomised to guarantee a very randomic slot machine behavior.

### Easy to Control

You can spin the wheels all together, or spin every single wheel one at a time.  
You can goto the next full combo or to the previous one or you can advance only a single wheel.  
You can finally go to a specific combo o move a single wheel to a specific slice.  
And you can do this by Javascript API or via default controls.

#### Default Controls

Spin Two Three comes with built-in default controls you can easyly implement in the markup just setting some classes.  
If you want to have an element which spins all the wheels when selected just add `spin-two-three-spin` class to the element, like this:

```html
	<a class="spin-two-three-spin control-class-1">SPIN</a>
```

If you want to have an element which goes to the next full combo when selected just add `spin-two-three-next` class to the element, like this:

```html
	<a class="spin-two-three-next control-class-1">NEXT</a>
```

If you want to have an element which goes to the previous full combo when selected just add `spin-two-three-prev` class to the element, like this:

```html
	<a class="spin-two-three-prev control-class-1">PREV</a>
```

Every control controls all the spinners woth the same control class defined when creating a Spin Two Three instance.  
If you want to control more than a spinner with a single button you can add more than a control class (or use the same control class in the instance declaration).  
If you want to control all the instances with a single button you can add the special class `spin-all` to the control, like this:

```html
	<a class="spin-two-three-spin spin-all">PREV</a>
```

You can mix control classes to create a complex control panel for your spinners. Take a look at the [Multiple Slots Example][example-multiple] for a working implementation.

#### Javascript APIs

There are some useful Javascript APIs to control the behaviour as you like.

```javascript
	SpinTwoThree.spin([Number wheel]);
```

Spins all the wheels to a random position.
If the optional `wheel` parameter is specified only the wheel corresponding to the value, starting at 0, will be spinned.

```javascript
	SpinTwoThree.next([Number wheel]);
```

Spins all the wheels to the next position.
If the optional `wheel` parameter is specified only the wheel corresponding to the value, starting at 0, will be spinned.

```javascript
	SpinTwoThree.prev([Number wheel]);
```

Spins all the wheels to the previous position.
If the optional `wheel` parameter is specified only the wheel corresponding to the value, starting at 0, will be spinned.

```javascript
	SpinTwoThree.gotoSlice(Number id, [Number wheel]);
```

Spins all the wheels to the selected position specified by the `id` parameter.
If the optional `wheel` parameter is specified only the wheel corresponding to the value, starting at 0, will be spinned.

```javascript
	SpinTwoThree.shuffle([Number wheel]);
```

Instantly shuffles the DOM content ot the wheels.
If the optional `wheel` parameter is specified only DOM inside the wheel corresponding to the value, starting at 0, will be shuffled.

```javascript
	SpinTwoThree.align([Number wheel]);
```
Aligns all the wheels to the value in the wheel specified by the optional `wheel` parameter.
If the optional `wheel` parameter is omitted every wheel will be aligned with the first one.

### Vertical or Horizontal?

I've write **Spin Two Three** because I need a sort of javacript version of the **LEGO Minifigure App** so the default configuration stacks the wheel vertically but you can have an horizontal slot machine just by adding the `horizontal` class to the container element, like this:

```html
	<div class="spin-two-three horizontal" id="your-unique-id">
		…
	</div>
```

### Dependencies

Spin Two Three uses the super-fast **GreenSock's TweenLite** to manage a couple of animations. You have to include the animation library from the CDN ([how to](http://www.greensock.com/get-started-js/)) or deploy the files on your server.
You need the core library and the CSS plugin.

```html
	<script src="http://cdnjs.cloudflare.com/ajax/libs/gsap/1.9.5/plugins/CSSPlugin.min.js"></script>
	<script src="http://cdnjs.cloudflare.com/ajax/libs/gsap/1.9.5/TweenLite.min.js"></script>
```

For more informations about Greensock Animation Platform visit the [library website](http://www.greensock.com/).

To build a (retro) cross-browser compatible experience **Spin Two Three** needs a small amount of polyfills to provide some modern features such:
- [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind) (natively supported only in modern browser); 
- [window.requestAnimationFrame](https://developer.mozilla.org/it/docs/DOM/window.requestAnimationFrame) (natively supported only in modern browser);
- [window.getComputedStyle](https://developer.mozilla.org/it/docs/DOM/window.getComputedStyle) (missing native support in IE8).

You can include `polyfills.js` in your markup or, if you already have this polyfills in some of your libraries (or if you can ignore some old browsers), feel free to ignore this file.

Include all the dependencies before `spin-two-three.js`.

 [example-vertical]: http://github.com/marcolago/spin-two-three/examples/vertical/
 [example-horizontal]: http://github.com/marcolago/spin-two-three/examples/horizontal/
 [example-multiple]: http://github.com/marcolago/spin-two-three/examples/multiple/
