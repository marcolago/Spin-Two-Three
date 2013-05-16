function SpinTwoThree(element, classes) {
	'use strict';

	var spinTwoThree = element,
		controlClasses = typeof classes === "string" ? [classes] : classes,
		slots = [],
		totalSlots = 0,
		sliceWidth = 0,
		spinsCompleted = 0,
		currentId = NaN;

	// initialization
	
	(function _init() {
		var spinners = spinTwoThree.querySelectorAll('.slices');
		//
		for (var i = 0; i < spinners.length; i++) {
			slots.push(new Slot(spinners[i]));
		}
		//
		var slot = slots[0];
		//
		sliceWidth = parseInt(window.getComputedStyle(slot.getSlice(0)).width);
		totalSlots = slot.getSlices().length;
		//
		_addEventListener("click", parseClick, false);
		_addEventListener("touchend", parseClick, false);
		//
		spinTwoThree.className += " started";
	})();

	function parseClick(e) {
		var className = e.target.className,
			enabled = false;
		//
		if (className.indexOf("spin-all") !== -1) {
			enabled = true;
		} else {
			for (var i = 0; i < controlClasses.length; i++) {
				if (className.indexOf(controlClasses[i]) !== -1) {
					enabled = true;
				}
			}
		}
		if (enabled) {
			if (className.indexOf("spin-two-three-spin") !== -1)
			{
				e.preventDefault();
				_spin();
			}
			else if (className.indexOf("spin-two-three-prev") !== -1)
			{
				e.preventDefault();
				_prev();
			}
			else if (className.indexOf("spin-two-three-next") !== -1)
			{
				e.preventDefault();
				_next();
			}
		}
	}

	function getLeft(el) {
		return (isNaN(parseInt(el.style.left)) ? 0 : parseInt(el.style.left));
	}

	function toArray(collection) {
		var ret = [];
		for (var i = 0; i < collection.length; i++)
		{
			ret[i] = collection[i];
		}
		return ret;
	}

	function shuffle(a) {
		// fisher yates algorithm
		var i = a.length;
		var j, _i, _j;
		if (i === 0)
		{
			return;
		}
		while (--i)
		{
			j = Math.floor(Math.random() * (i + 1));
			_i = a[i];
			_j = a[j];
			a[i] = _j;
			a[j] = _i;
		}
	}

	function reorder(a) {
		var p = a[0].parentNode;
		for (var i = 0; i < a.length; i++)
		{
			var el = a[i];
			p.appendChild(el);
		}
	}

	function Slot(slices) {
		var slot = slices,
			slices = slot.querySelectorAll(".slice"),
			slicesArray = toArray(slices),
			_length = slicesArray.length,
			stopped = true;
		for (var i = 0; i < slicesArray.length; i++) {
			slicesArray[i].index = i;
		}
		//
		var animStatus = 0;
		var delta = 0;
		var maxSpeed = 100;

		function _shuffle() {
			shuffle(slicesArray);
			reorder(slicesArray);
		}

		function _spin() {
			console.log("_spin", stopped);
			if (stopped === true) {
				maxSpeed = Math.floor((Math.random() * 100) + 75);
				stopped = false;
				_rollSlot();
			}
		}

		function _stop() {
			console.log("_stop");
			stopped = true;
		}

		function _rollSlot() {
			parseSlices(true);
			//
			if (delta !== 0)
			{
				slot.style.left = getLeft(slot) - delta + "px";
			}
			//
			if (getLeft(slot) < -(sliceWidth * 2))
			{
				var leftDelta = Math.abs(getLeft(slot)) - (sliceWidth * 2);
				var toReorder = slicesArray.shift();
				slicesArray.push(toReorder);
				slot.appendChild(toReorder);
				slot.style.left = -(sliceWidth + leftDelta) + "px";
			}
			//
			if(animStatus !== 2 && stopped !== true)
			{
				requestAnimFrame(_rollSlot);
			}
			else
			{
				delta = 0;
				animStatus = 0;
			}
			if (delta >= maxSpeed)
			{
				animStatus = 1;
			}
			else if (delta <= -maxSpeed)
			{
				animStatus = 1;
			}
			else if (delta === 0 && animStatus === 1)
			{
				animStatus = 2;
			}
			//
			if (animStatus === 0)
			{
				delta += 1;
			}
			else if (animStatus === 1)
			{
				delta -= 1;
			}
			else if (animStatus === 2)
			{
				delta = 0;
				_gotoNearest();
			}

		}

		function _gotoNearest() {
			var l = "" + (-sliceWidth) + "px";
			TweenLite.to(slot, 0.5, { left:l, ease:Cubic.easeInOut, onComplete: _reset });
		}

		function _reset() {
			_stop();
			var n = Math.floor(Math.abs(getLeft(slot)) / sliceWidth);
			var toReorderArray = slicesArray.splice(0, n);
			for (var i = 0; i < toReorderArray.length; i++) {
				var toReorder = toReorderArray[i];
				slicesArray.push(toReorder);
				slot.appendChild(toReorder);
			}
			slot.style.left = 0 + "px";
			//
			parseSlices();
		}

		function _goto(id) {
			parseSlices(true);
			var count = 0;
			_stop();
			for (var i = 0; i < slicesArray.length; i++)
			{
				var s = slicesArray[i];
				if (s.index == id)
				{
					count = i;
					break;
				}
			}
			var t = (Math.random() * 750 + 1250) / 1000;
			var l = "" + (-sliceWidth * count) + "px";
			var that = this;
			TweenLite.to(slot, t, { css:{ left:l }, ease:Cubic.easeInOut, onComplete: _reset });
		}

		function _getSlice(id) {
			if (id === undefined) {
				return slicesArray[0];
			}
			return slicesArray[id];
		}
		
		function _getSlices() {
			return slicesArray;
		}

		return {
			shuffle: _shuffle,
			spin: _spin,
			gotoSlot: _goto,
			getSlice: _getSlice,
			getSlices: _getSlices,
			length: _length
		}
	}

	function parseSlices(decrement) {
		if (decrement === true) {
			spinsCompleted = Math.max(0, spinsComplete -= 1);
		} else {
			spinsCompleted += 1;
			if (spinsCompleted === slots.length)
			{
				spinsCompleted = 0;
				//
				var _slots = [];
				for (var i = 0; i < slots.length; i++) {
					_slots.push(slots[i]);
				}
				//
				dispatchEvent("spincomplete", { slots: _slots });
			}
		}
	}

	function dispatchEvent(t, ps) {
		if (document.createEvent)
		{
			var e = document.createEvent("HTMLEvents");
			e.initEvent(t, true, true);
			for (var p in ps) {
				e[p] = ps[p];
			}
			document.dispatchEvent(e);
		}
	}

	function _addEventListener(type, handler, useCapture) {
		if (document.addEventListener)
		{
			document.addEventListener(type, handler, useCapture);
		}
		else if (document.attachEvent)
		{
			document.attachEvent(type, handler);
		}
	}
	
	// animation
	
	function animloop() {
		requestAnimFrame(animloop);
		// place the rAF *before* the render() to assure as close to 
		// 60fps with the setTimeout fallback.
		for (var i = 0; i < slots.length; i++) {
			render(slots[i]);
		}
	}

	// public methods

	function _shuffle(slotIndex) {
		if (slotIndex !== undefined) {
			slots[slotIndex].shuffle();
		} else {
			for (var i = 0; i < slots.length; i++) {
				slots[i].shuffle();
			}
		}
	}

	function _spin(slotIndex) {
		if (slotIndex !== undefined) {
			slots[slotIndex].spin();
		} else {
			for (var i = 0; i < slots.length; i++) {
				slots[i].spin();
			}
		}
		dispatchEvent("spinstart");
	}

	function _prev(slotIndex) {
		if (slotIndex !== undefined) {
			var dest = slots[slotIndex].getSlice().index - 1;
			if (dest < 0) {
				dest = slots[slotIndex].length - 1;
			}
			slots[slotIndex].gotoSlot(dest);
		} else {
			if (isNaN(currentId) || currentId <= 0)
			{
				currentId = totalSlots;
			}
			currentId -= 1;
			_gotoSlot(currentId);
		}
	}

	function _next(slotIndex) {
		if (slotIndex !== undefined) {
			var dest = slots[slotIndex].getSlice().index + 1;
			if (dest > slots[slotIndex].length - 1) {
				dest = 0;
			}
			slots[slotIndex].gotoSlot(dest);
		} else {
			if (isNaN(currentId) || currentId >= totalSlots - 1)
			{
				currentId = -1;
			}
			currentId += 1;
			_gotoSlot(currentId);
		}
	}

	function _gotoSlot(id) {
		for (var i = 0; i < slots.length; i++) {
			slots[i].gotoSlot(id);
		}
		dispatchEvent("spinstart");
	}

	function _align(slotIndex) {
		slotIndex = slotIndex || 0;
		_gotoSlot(slots[slotIndex].getSlice().index);
	}

	// API

	return {
		shuffle: _shuffle,
		spin: _spin,
		prev: _prev,
		next: _next,
		gotoSlot: _gotoSlot,
		align: _align,
		addEventListener: _addEventListener
	};

}