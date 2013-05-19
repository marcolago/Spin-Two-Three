function SpinTwoThree(element, classes) {
	'use strict';

	var spinTwoThree = element;
	var controlClasses = typeof classes === "string" ? [classes] : classes;
	var slots = [];
	var totalSlots = 0;
	var sliceSize = 0;
	var spinsCompleted = 0;
	var currentId = 0;
	var firstSpinned = false;
	var _isVertical = true;

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
		if (spinTwoThree.className.match(/\bhorizontal\b/) !== null) {
			sliceSize = parseInt(window.getComputedStyle(slot.getSlice(0)).height);
			_isVertical = false;
		} else {
			sliceSize = parseInt(window.getComputedStyle(slot.getSlice(0)).width);
		}
		totalSlots = slot.getSlices().length;
		//
		_addEventListener("click", parseClick, false);
		_addEventListener("touchend", parseClick, false);
		//
		spinTwoThree.className += " started";
	})();

	function parseClick(e) {
		var className = e.target.className;
		var enabled = false;
		//
		if (className.match(/\bspin-all\b/) !== null) {
			enabled = true;
		} else {
			for (var i = 0; i < controlClasses.length; i++) {
				var rgx = new RegExp(controlClasses[i]);
				if (className.match(rgx) !== null) {
					enabled = true;
				}
			}
		}
		if (enabled) {
			if (className.match(/\bspin-two-three-spin\b/) !== null) {
				e.preventDefault();
				_spin();
			} else if (className.match(/\bspin-two-three-prev\b/) !== null) {
				e.preventDefault();
				_prev();
			} else if (className.match(/\bspin-two-three-next\b/) !== null) {
				e.preventDefault();
				_next();
			}
		}
	}

	function getLimit(el) {
		if (_isVertical) {
			return (isNaN(parseInt(el.style.left)) ? 0 : parseInt(el.style.left));	
		} else {
			return (isNaN(parseInt(el.style.top)) ? 0 : parseInt(el.style.top));	
		}
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
		var slot = slices;
		var slices = slot.querySelectorAll(".slice");
		var slicesArray = toArray(slices);
		var _length = slicesArray.length;
		var animStatus = 0;
		var delta = 0;
		var maxSpeed = 100;
		var stopped = true;
		//
		for (var i = 0; i < slicesArray.length; i++) {
			slicesArray[i].index = i;
		}

		function _shuffle() {
			shuffle(slicesArray);
			reorder(slicesArray);
		}

		function _spin() {
			if (stopped === true) {
				stopped = false;
				maxSpeed = Math.floor((Math.random() * 100) + 75);
				parseSlices(true);
				var doRoll = _rollSlot.bind(this);
				doRoll();
				dispatchEvent("spinstartsingle", { slot: this });
				return true;
			}
			return false;
		}

		function _stop() {
			stopped = true;
		}

		function _rollSlot() {
			//
			if (delta !== 0)
			{
				if (_isVertical) {
					slot.style.left = getLimit(slot) - delta + "px";
				} else {
					slot.style.top = getLimit(slot) - delta + "px";
				}
			}
			//
			if (getLimit(slot) < -sliceSize)
			{
				var limitDelta = Math.abs(getLimit(slot)) % sliceSize;
				var n = Math.floor(Math.abs(getLimit(slot)) / sliceSize);
				var toReorderArray = slicesArray.splice(0, n);
				for (var i = 0; i < toReorderArray.length; i++) {
					var toReorder = toReorderArray[i];
					slicesArray.push(toReorder);
					slot.appendChild(toReorder);
				}
				if (_isVertical) {
					slot.style.left = -limitDelta + "px";	
				} else {
					slot.style.top = -limitDelta + "px";
				}
			}
			//
			if(animStatus !== 2 && stopped !== true)
			{
				var cb = _rollSlot.bind(this);
				requestAnimFrame(cb);
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
				var doNearest = _gotoNearest.bind(this);
				doNearest();
			}
		}

		function _gotoNearest() {
			var l = "0px";
			var cb = _reset.bind(this);
			if (_isVertical) {
				TweenLite.to(slot, 0.5, { left:l, ease:Cubic.easeInOut, onComplete: cb });
			} else {
				TweenLite.to(slot, 0.5, { top:l, ease:Cubic.easeInOut, onComplete: cb });
			}
		}

		function _reset() {
			_stop();
			var n = Math.floor(Math.abs(getLimit(slot)) / sliceSize);
			var toReorderArray = slicesArray.splice(0, n);
			for (var i = 0; i < toReorderArray.length; i++) {
				var toReorder = toReorderArray[i];
				slicesArray.push(toReorder);
				slot.appendChild(toReorder);
			}
			if (_isVertical) {
				slot.style.left = 0 + "px";	
			} else {
				slot.style.top = 0 + "px";
			}
			//
			dispatchEvent("spincompletesingle", { slot: this });
			parseSlices();
		}

		function _goto(id) {
			if (stopped === true) {
				stopped = false;
				parseSlices(true);
				var count = 0;
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
				var l = "" + (-sliceSize * count) + "px";
				var cb = _reset.bind(this);
				if (_isVertical) {
					TweenLite.to(slot, t, { css:{ left:l }, ease:Cubic.easeInOut, onComplete: cb });	
				} else {
					TweenLite.to(slot, t, { css:{ top:l }, ease:Cubic.easeInOut, onComplete: cb });
				}
				dispatchEvent("spinstartsingle", { slot: this });
			}
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
			spinsCompleted = Math.max(0, spinsCompleted -= 1);
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
		if (firstSpinned === false) {
			currentId = NaN;
		}
	}

	function _spin(slotIndex) {
		if (slotIndex !== undefined) {
			slots[slotIndex].spin();
		} else {
			var spinStarted = false;
			for (var i = 0; i < slots.length; i++) {
				var isStarted = slots[i].spin();
				spinStarted = spinStarted === false ? isStarted === true : true;
			}
			if (spinStarted) {
				dispatchEvent("spinstart");
			}
		}
		firstSpinned = true;
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