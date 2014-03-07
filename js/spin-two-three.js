/*!
 * Spin Two Three
 * https://github.com/marcolago/Spin-Two-Three
 * MIT licensed
 *
 * Copyright (C) 2013-now Marco Lago, http://marcolago.com
 */
function SpinTwoThree(element, classes) {
  'use strict';

  var SLICES_CLASS =                ".slices";
  var SLICE_CLASS =                 ".slice";
  var EVENT_SPIN_START_SINGLE =     "spinstartsingle"
  var EVENT_SPIN_START =            "spinstart"
  var EVENT_SPIN_COMPLETE_SINGLE =  "spincompletesingle"
  var EVENT_SPIN_COMPLETE =         "spincomplete"

  var _COMMAND_SPIN =                "spin";
  var _COMMAND_GOTO =                "goto";

  var spinTwoThree = element;
  var controlClasses = [];
  var slots = [];
  var totalSlots = 0;
  var sliceSize = 0;
  var spinsCompleted = 0;
  var isSpinning = false;
  var currentId = 0;
  var firstSpinned = false;
  var isVertical = true;
  var unit = "%";
  var usePx = false;
  var _override = false;

  var callbackStartSingle = undefined;
  var callbackStart = undefined;
  var callbackCompleteSingle = undefined;
  var callbackComplete = undefined;

  // initialization
  
  if (classes !== undefined) {
    if (typeof classes === "string") {
      controlClasses.push(classes)
    } else {
      controlClasses = classes;
    }
  }

  (function _init() {
    var wheels = spinTwoThree.querySelectorAll(SLICES_CLASS);
    //
    for (var i = 0; i < wheels.length; i++) {
      slots.push(new Slot(wheels[i]));
    }
    spinsCompleted = slots.length;
    //
	  getSliceSize();
    //
    totalSlots = slots[0].getSlices().length;
    //
    _addEventListener("click", parseClick, false);
    // _addEventListener("touchend", parseClick, false);
    //
    spinTwoThree.className += " started";
  })();
  
  function getSliceSize() {
    if (spinTwoThree.className.match(/\bhorizontal\b/) !== null) {
      sliceSize = usePx === false ? 100 : parseInt(window.getComputedStyle(slots[0].getSlice(0)).height);
      isVertical = false;
    } else {
      sliceSize = usePx === false ? 100 : parseInt(window.getComputedStyle(slots[0].getSlice(0)).width);
    }
  }

  function parseClick(e) {
    var t = e.target || e.srcElement;
    var className = t.className;
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
      var parsed = false;
      if (className.match(/\bspin-two-three-spin\b/) !== null) {
        _spin();
        parsed = true;
      } else if (className.match(/\bspin-two-three-prev\b/) !== null) {
        _prev();
        parsed = true;
      } else if (className.match(/\bspin-two-three-next\b/) !== null) {
        _next();
        parsed = true;
      }
      if (parsed === true) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
      }
    }
  }

  function getLimit(el) {
    if (isVertical) {
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

  function parseSlices(decrement) {
    if (decrement === true) {
      spinsCompleted = Math.max(0, spinsCompleted -= 1);
    } else {
      spinsCompleted += 1;
      if (spinsCompleted === slots.length)
      {
        var _slots = [];
        for (var i = 0; i < slots.length; i++) {
          _slots.push(slots[i]);
        }
        //
        dispatchEvent(EVENT_SPIN_COMPLETE, { slots: _slots });
      }
    }
  }

/*
######## ##     ## ######## ##    ## ########  ######  
##       ##     ## ##       ###   ##    ##    ##    ## 
##       ##     ## ##       ####  ##    ##    ##       
######   ##     ## ######   ## ## ##    ##     ######  
##        ##   ##  ##       ##  ####    ##          ## 
##         ## ##   ##       ##   ###    ##    ##    ## 
########    ###    ######## ##    ##    ##     ######  
*/

  function dispatchEvent(t, ps) {
    // events
    var obj = {};
    if (document.createEvent) {
      obj = document.createEvent("HTMLEvents");
      obj.initEvent(t, true, true);
      for (var p in ps) {
        obj[p] = ps[p];
      }
      document.dispatchEvent(obj);
    }
    // callbacks
    obj = {};
    for (var p in ps) {
      obj[p] = ps[p];
    }
    var cb = undefined;
    switch (t) {
      case EVENT_SPIN_START_SINGLE :
        obj.type = EVENT_SPIN_START_SINGLE;
        cb = callbackStartSingle;
        break;
      case EVENT_SPIN_START :
        obj.type = EVENT_SPIN_START;
        cb = callbackStart;
        break;
      case EVENT_SPIN_COMPLETE_SINGLE :
        obj.type = EVENT_SPIN_COMPLETE_SINGLE;
        cb = callbackCompleteSingle;
        break;
      case EVENT_SPIN_COMPLETE :
        obj.type = EVENT_SPIN_COMPLETE;
        cb = callbackComplete;
        break;
    }
    if (cb) {
      cb(obj);
    }
  }

  function _addEventListener(type, handler, useCapture) {
    if (document.addEventListener) {
      document.addEventListener(type, handler, useCapture);
    } else if (document.attachEvent) {
      document.attachEvent("on" + type, handler);
    }
  }

/*
 ######  ##        #######  ########     #######  ########        ## 
##    ## ##       ##     ##    ##       ##     ## ##     ##       ## 
##       ##       ##     ##    ##       ##     ## ##     ##       ## 
 ######  ##       ##     ##    ##       ##     ## ########        ## 
      ## ##       ##     ##    ##       ##     ## ##     ## ##    ## 
##    ## ##       ##     ##    ##       ##     ## ##     ## ##    ## 
 ######  ########  #######     ##        #######  ########   ######     
*/

  function Slot(slices) {
    var slot = slices;
    var slices = slot.querySelectorAll(SLICE_CLASS);
    var slicesArray = toArray(slices);
    var _length = slicesArray.length;
    var animStatus = 0;
    var delta = 0;
    var maxSpeed = 100;
    var _isSpinning = false;
    //
    for (var i = 0; i < slicesArray.length; i++) {
      slicesArray[i].index = i;
    }

    function _shuffle() {
      shuffle(slicesArray);
      reorder(slicesArray);
    }

    function _spin() {
      if (_isSpinning === false || _override === true) {
        _isSpinning = true;
        maxSpeed = Math.floor((Math.random() * 100) + 75) * (usePx === true ? 1 : 0.35);
        var doRoll = _rollSlot.bind(this);
        doRoll();
        dispatchEvent(EVENT_SPIN_START_SINGLE, { slot: this, command: _COMMAND_SPIN });
        return true;
      }
      return false;
    }

    function _stop() {
      _isSpinning = false;
    }

    function _rollSlot() {
      //
      if (delta !== 0)
      {
        if (isVertical) {
          slot.style.left = getLimit(slot) - delta + "%";
        } else {
          slot.style.top = getLimit(slot) - delta + "%";
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
        if (isVertical) {
          slot.style.left = -limitDelta + "%"; 
        } else {
          slot.style.top = -limitDelta + "%";
        }
      }
      //
      if(animStatus !== 2 && _isSpinning !== false)
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
        delta += (usePx === true ? 1 : 0.5);
      }
      else if (animStatus === 1)
      {
        delta -= (usePx === true ? 1 : 0.5);
      }
      else if (animStatus === 2)
      {
        delta = 0;
        var doNearest = _gotoNearest.bind(this);
        doNearest();
      }
    }

    function _gotoNearest() {
      var l = "0" + unit;
      var cb = _reset.bind(this);
      if (isVertical) {
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
      if (isVertical) {
        slot.style.left = 0 + unit; 
      } else {
        slot.style.top = 0 + unit;
      }
      //
      dispatchEvent(EVENT_SPIN_COMPLETE_SINGLE, { slot: this });
      parseSlices();
    }

    function _goto(id, backspin) {
      if (_isSpinning === false || _override === true) {
        _isSpinning = true;
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
        //
        var t = ((Math.random() * 750) + 1250) / 1000;
        var cb = _reset.bind(this);
        var l;
        //
        if (backspin === true) {
          var toReorderArray = slicesArray.splice(0, count);
          for (var i = 0; i < toReorderArray.length; i++) {
            var toReorder = toReorderArray[i];
            slicesArray.push(toReorder);
            slot.appendChild(toReorder);
          }
          l = "0" + unit;
          if (isVertical) {
            slot.style.left = -sliceSize * (_length - count) + unit;
          } else {
            slot.style.top = -sliceSize * (_length - count) + unit;
          }
        } else {
          l = "" + (-sliceSize * count) + unit;
        }
        //
        if (isVertical) {
          TweenLite.to(slot, t, { css:{ left:l }, ease:Cubic.easeInOut, onComplete: cb });  
        } else {
          TweenLite.to(slot, t, { css:{ top:l }, ease:Cubic.easeInOut, onComplete: cb });
        }
        dispatchEvent(EVENT_SPIN_START_SINGLE, { slot: this, command: _COMMAND_GOTO, index: id, backspin: backspin });
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

    function _getSpinningStatus() {
      return _isSpinning;
    }

    return {
      shuffle: _shuffle,
      spin: _spin,
      gotoSlice: _goto,
      getSlice: _getSlice,
      getSlices: _getSlices,
      length: _length,
      isSpinning: _getSpinningStatus
    }
  }
  
/*
   ###    ##    ## #### ##     ##    ###    ######## ####  #######  ##    ## 
  ## ##   ###   ##  ##  ###   ###   ## ##      ##     ##  ##     ## ###   ## 
 ##   ##  ####  ##  ##  #### ####  ##   ##     ##     ##  ##     ## ####  ## 
##     ## ## ## ##  ##  ## ### ## ##     ##    ##     ##  ##     ## ## ## ## 
######### ##  ####  ##  ##     ## #########    ##     ##  ##     ## ##  #### 
##     ## ##   ###  ##  ##     ## ##     ##    ##     ##  ##     ## ##   ### 
##     ## ##    ## #### ##     ## ##     ##    ##    ####  #######  ##    ## 
*/
  
  function animloop() {
    requestAnimFrame(animloop);
    // place the rAF *before* the render() to assure as close to 
    // 60fps with the setTimeout fallback.
    for (var i = 0; i < slots.length; i++) {
      render(slots[i]);
    }
  }

/*
   ###    ########  #### 
  ## ##   ##     ##  ##  
 ##   ##  ##     ##  ##  
##     ## ########   ##  
######### ##         ##  
##     ## ##         ##  
##     ## ##        #### 
*/

  function _shuffle(slotIndex) {
    if (slotIndex !== undefined && slotIndex < slots.length) {
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
    var spinStarted = false;
    if (slotIndex !== undefined && slotIndex < slots.length) {
      var s = slots[slotIndex];
      if (s.isSpinning()=== false || _override === true) {
        s.spin();
        setSpin(s);
      }
      spinStarted = true;
    } else {
      for (var i = 0; i < slots.length; i++) {
        var s = slots[i];
        if (s.isSpinning()=== false) {
          s.spin();
        }
        spinStarted = spinStarted === false ? s.isSpinning()=== true : true;
        setSpin(s);
      }
    }
    if (spinStarted) {
      dispatchEvent(EVENT_SPIN_START, { command: _COMMAND_SPIN });
    }
    firstSpinned = true;
  }

  function _prev(slotIndex) {
    if (slotIndex !== undefined && slotIndex < slots.length) {
      var s = slots[slotIndex];
      var dest = s.getSlice().index - 1;
      if (dest < 0) {
        dest = s.length - 1;
      }
      if (s.isSpinning()=== false || _override === true) {
        _goto(dest, slotIndex, true);
      }
    } else {
      for (var i = 0; i < slots.length; i++) {
        if (slots[i].isSpinning() !== false && _override === true)
        {
          return;
        }
      }
      var idTo = currentId;
      if (isNaN(currentId) || currentId <= 0)
      {
        idTo = totalSlots;
      }
      idTo -= 1;
      _goto(idTo, undefined, true);
    }
  }

  function _next(slotIndex) {
    if (slotIndex !== undefined && slotIndex < slots.length) {
      var s = slots[slotIndex];
      var dest = s.getSlice().index + 1;
      if (dest > s.length - 1) {
        dest = 0;
      }
      if (s.isSpinning()=== false || _override === true) {
        _goto(dest, slotIndex);
      }
    } else {
      for (var i = 0; i < slots.length; i++) {
        if (slots[i].isSpinning() === true && _override === false)
        {
          return;
        }
      }
      var idTo = currentId
      if (isNaN(currentId) || currentId >= totalSlots - 1)
      {
        idTo = -1;
      }
      idTo += 1;
      _goto(idTo);
    }
  }

  function _goto(id, slotIndex, backspin) {
    var willGo = false;
    if (slotIndex !== undefined && slotIndex < slots.length) {
      var s = slots[slotIndex];
      if (s.isSpinning()=== false || _override === true) {
        s.gotoSlice(id, backspin);
        setSpin(s);
        currentId = id;
        willGo = true;
      }
    } else {
      for (var i = 0; i < slots.length; i++) {
        var s = slots[i];
        if (s.isSpinning()=== false || _override === true) {
          s.gotoSlice(id, backspin);
          setSpin(s);
          currentId = id;
          willGo = true;
        }
      }
      if (willGo === true) {
        dispatchEvent(EVENT_SPIN_START, { command: _COMMAND_GOTO, index: id, backspin: backspin });
      }
    }
  }
  
  function _align(slotIndex) {
    slotIndex = slotIndex || 0;
    _goto(slots[slotIndex].getSlice().index);
  }

  function setSpin(slot) {
    if (slot.isSpinning() === true) {
      spinsCompleted = Math.max(0, spinsCompleted - 1);
    }
  }

  function _setCallbackStartSingle(callback) {
    callbackStartSingle = callback;
  }

  function _setCallbackStart(callback) {
    callbackStart = callback;
  }

  function _setCallbackCompleteSingle(callback) {
    callbackCompleteSingle = callback;
  }

  function _setCallbackComplete(callback) {
    callbackComplete = callback;
  }

  function _usePixels(value) {
    if (value === true) {
      usePx = true;
      unit = "px";
    } else {
      usePx = false;
      unit = "%";
    }
	getSliceSize();
  }

  function _setSpinOverride(value) {
    _override = value;
  }

  // API

  return {
    commandSpin: _COMMAND_SPIN,
    commandGoto: _COMMAND_GOTO,
    shuffle: _shuffle,
    spin: _spin,
    prev: _prev,
    next: _next,
    gotoSlice: _goto,
    align: _align,
    addEventListener: _addEventListener,
    setCallbackStartSingle: _setCallbackStartSingle,
    setCallbackStart: _setCallbackStart,
    setCallbackCompleteSingle: _setCallbackCompleteSingle,
    setCallbackComplete: _setCallbackComplete,
    usePixels: _usePixels,
    setSpinOverride: _setSpinOverride
  };
}
