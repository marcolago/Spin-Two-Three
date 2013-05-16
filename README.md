# Spin Two Three
## A Really Simple Absolutely Randomic Slot Machine Mini Library.

If you need a basic slot machine script wich is easy to plug and slightly customizable **Spin Two Three** is the right script for you.

### Easy to Plug

Just include `spin-two-three.js` and the dependencies at the bottom of your markup, include the `spin-two-three.css` and customize the look as you need and, at last, white down the markup as follow:

```html
	<div class="spin-two-three" id="your-unique-id">
		<div class="spinner">
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

### Vertical or Horizontal?

I've write **Spin Two Three** because I need a javacript version of the **LEGO Minifigure App** so the default configuration stacks the slots vertically but you can have an horizontal slot machine just by adding the `horizontal` class to the container element, like this:

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

To build a (retro) cross-browser compatible experience **Spin Two Three** needs a small amout of polyfills to provide some modern features such:
- [window.requestAnimationFrame](https://developer.mozilla.org/it/docs/DOM/window.requestAnimationFrame) (natively supported only in modern browser)
- [window.getComputedStyle](https://developer.mozilla.org/it/docs/DOM/window.getComputedStyle) (missing native support in IE8)

You can include `polyfills.js` in your markup or, if you already have this polyfills in some of your libraries (or if you can ignore some old browsers), feel free to ignore this file.

Include all the dependencies before `spin-two-three.js`.