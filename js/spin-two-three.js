/*!
 * Spin Two Three
 * https://github.com/marcolago/Spin-Two-Three
 * MIT licensed
 *
 * Copyright (C) 2013-now Marco Lago, http://marcolago.com
 */
function SpinTwoThree(element, classes, slotsDelay, slotsSpinTime) {
  'use strict';

  var SLICES_CLASS = ".slices";
  var SLICE_CLASS = ".slice";
  var TRIGGER_CLASS_NAME = "spin-two-three-trigger";
  var TRIGGER_CLASS = "." + TRIGGER_CLASS_NAME;
  var EVENT_SPIN_START_SINGLE = "spinstartsingle"
  var EVENT_SPIN_START = "spinstart"
  var EVENT_SPIN_COMPLETE_SINGLE = "spincompletesingle"
  var EVENT_SPIN_COMPLETE = "spincomplete"

  var _COMMAND_SPIN = "spin";
  var _COMMAND_GOTO = "goto";

  var spinTwoThree = element;
  var controlClasses = [];
  var slots = [];
  var slotsDelay = slotsDelay || NaN;
  var totalSlots = 0;
  var sliceSize = 0;
  var spinsCompleted = 0;
  var spinTime =  slotsSpinTime || 1000;
  var isSpinning = false;
  var currentId = 0;
  var firstSpinned = false;
  var isVertical = true;
  var unit = "%";
  var usePx = false;
  var transitionSpeedModifier = 0.8;
  var _override = false;

  var callbackStartSingle = undefined;
  var callbackStart = undefined;
  var callbackCompleteSingle = undefined;
  var callbackComplete = undefined;

  // initialization

  controlClasses.push("spin-all");
  if (classes !== undefined) {
    if (typeof classes === "string") {
      controlClasses.push(classes)
    } else {
      controlClasses = classes;
    }
  }

  var triggers = [];
  for (var i = 0; i < controlClasses.length; i++) {
    var triggersTmp = document.querySelectorAll("." + controlClasses[i]);
    if (triggersTmp.length > 0) {
      for (var j = 0; j < triggersTmp.length; j++) {
        triggers.push(triggersTmp[j]);
      }
    }
  }

  for (var i = 0; i < triggers.length; i++) {
    var trigger = triggers[i];
    trigger.className += " " + TRIGGER_CLASS_NAME;
    addControlsListener(trigger, "click", parseClick, false);
  }

  function addControlsListener(element, type, handler, useCapture) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, useCapture);
    } else if (element.attachEvent) {
      element.attachEvent("on" + type, handler);
    }
  }

  (function _init() {
    var wheels = spinTwoThree.querySelectorAll(SLICES_CLASS);
    //
    for (var i = 0; i < wheels.length; i++) {
      slots.push(new Slot(wheels[i], i, i * slotsDelay));
    }
    spinsCompleted = slots.length;
    //
    getSliceSize();
    //
    totalSlots = slots[0].getSlices().length;
    //
    // _addEventListener("click", parseClick, false);
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

  var eventParsing = false;

  function isTrigger(t) {
    var rgx = new RegExp(TRIGGER_CLASS_NAME);
    if (t.className.match(rgx) !== null) {
      return true;
    }
    return false;
  }

  function parseClick(e) {
    var t = e.target || e.srcElement;
    var className = "";
    var enabled = false;
    //
    if (eventParsing === false) {
      while (isTrigger(t) === false) {
        t = t.parentNode;
      }
      enabled = true;
      className = t.className;
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
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
        return false;
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
    for (var i = 0; i < collection.length; i++) {
      ret[i] = collection[i];
    }
    return ret;
  }

  function shuffle(a) {
    // fisher yates algorithm
    var i = a.length;
    var j, _i, _j;
    if (i === 0) {
      return;
    }
    while (--i) {
      j = Math.floor(Math.random() * (i + 1));
      _i = a[i];
      _j = a[j];
      a[i] = _j;
      a[j] = _i;
    }
  }

  function reorder(a) {
    var p = a[0].parentNode;
    for (var i = 0; i < a.length; i++) {
      var el = a[i];
      p.appendChild(el);
    }
  }

  function parseSlices(decrement) {
    if (decrement === true) {
      spinsCompleted = Math.max(0, spinsCompleted -= 1);
    } else {
      spinsCompleted += 1;
      if (spinsCompleted === slots.length) {
        var _slots = [];
        for (var i = 0; i < slots.length; i++) {
          _slots.push(slots[i]);
        }
        //
        dispatchEvent(EVENT_SPIN_COMPLETE, {
          slots: _slots
        });
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
      case EVENT_SPIN_START_SINGLE:
        obj.type = EVENT_SPIN_START_SINGLE;
        cb = callbackStartSingle;
        break;
      case EVENT_SPIN_START:
        obj.type = EVENT_SPIN_START;
        cb = callbackStart;
        break;
      case EVENT_SPIN_COMPLETE_SINGLE:
        obj.type = EVENT_SPIN_COMPLETE_SINGLE;
        cb = callbackCompleteSingle;
        break;
      case EVENT_SPIN_COMPLETE:
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

  function Slot(slices, index, slotDelay) {
    var slot = slices;
    var index = index;
    var slices = slot.querySelectorAll(SLICE_CLASS);
    var slicesArray = toArray(slices);
    var _length = slicesArray.length;
    var delay = slotDelay || 0;
    var minSpeed = 15;
    var decelerationSpeed = 1;
    //
    var animStatus = -1;
    var delta;
    var speedIncrement;
    var maxSpeed;
    var delayTimeout;
    var _isSpinning = false;
    var _isSlowing = false;
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
        _isSlowing = false;
        animStatus = 0;
        delta = 0;
        speedIncrement = 0.8 + (Math.random() * 2);
        maxSpeed = (Math.random() * 20) + 20;
        //maxSpeed = minSpeed + (Math.floor(speed) * (usePx === true ? 1 : 0.35) * (0.1 * index));
        
        clearInterval(delayTimeout);
        delayTimeout = setTimeout(function() {
          _isSlowing = true;
          clearInterval(delayTimeout);
        }, spinTime + delay);
        
        var doRoll = _rollSlot.bind(this);
        doRoll();

        dispatchEvent(EVENT_SPIN_START_SINGLE, {
          slot: this,
          command: _COMMAND_SPIN
        });
        return true;
      }
      return false;
    }

    function _stop() {
      _isSpinning = false;
    }

    function _rollSlot() {
      //
      if (delta !== 0) {
        if (isVertical) {
          slot.style.left = getLimit(slot) - delta + "%";
        } else {
          slot.style.top = getLimit(slot) - delta + "%";
        }
      }
      //
      if (getLimit(slot) < -sliceSize) {
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
      if (animStatus !== -1 && _isSpinning !== false) {
        // slot is spinning
        var cb = _rollSlot.bind(this);
        requestAnimFrame(cb);
      } else {
        // slot is stopped
        delta = 0;
        animStatus = 0;
      }
      if (Math.abs(delta) >= Math.abs(maxSpeed)) {
        // slot is spinning and
        if (_isSlowing === true) {
          // is slowing
          animStatus = 1;
        } else {
          // is at max speed waiting for the timeout
          animStatus = 2;
        }
      } else if ((Math.floor(delta) <= speedIncrement && animStatus === 1) || (Math.floor(delta) <= speedIncrement && animStatus === 2)) {
        // slot is stopping
        animStatus = -1;
      }
      //
      if (animStatus === 0) {
        // is accelerating
        delta += (usePx === true ? speedIncrement : 0.5 * speedIncrement);
      } else if (animStatus === 1) {
        // is decelerating
        delta -= (usePx === true ? decelerationSpeed : decelerationSpeed * 0.5);
      } else if (animStatus === 2) {
        // is at max speed
        delta = maxSpeed;
      } else if (animStatus === -1) {
        // is stopped and going in place
        delta = 0;
        var doNearest = _gotoNearest.bind(this);
        doNearest();
      }
    }

    function _gotoNearest() {
      var l = "0" + unit;
      var cb = _reset.bind(this);
      if (isVertical) {
        TweenLite.to(slot, 0.35, {
          left: l,
          ease: Cubic.easeInOut,
          onComplete: cb
        });
      } else {
        TweenLite.to(slot, 0.35, {
          top: l,
          ease: Cubic.easeInOut,
          onComplete: cb
        });
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
      dispatchEvent(EVENT_SPIN_COMPLETE_SINGLE, {
        slot: this
      });
      parseSlices();
    }

    function _goto(id, backspin) {
      if (_isSpinning === false || _override === true) {
        _isSpinning = true;
        var count = 0;
        for (var i = 0; i < slicesArray.length; i++) {
          var s = slicesArray[i];
          if (s.index == id) {
            count = i;
            break;
          }
        }
        //
        var t = (((Math.random() * 750) + 1250) / 1000) * transitionSpeedModifier;
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
          TweenLite.to(slot, t, {
            css: {
              left: l
            },
            ease: Cubic.easeInOut,
            onComplete: cb
          });
        } else {
          TweenLite.to(slot, t, {
            css: {
              top: l
            },
            ease: Cubic.easeInOut,
            onComplete: cb
          });
        }
        dispatchEvent(EVENT_SPIN_START_SINGLE, {
          slot: this,
          command: _COMMAND_GOTO,
          index: id,
          backspin: backspin
        });
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

    function _getIndex() {
      return index;
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
      getIndex: _getIndex,
      isSpinning: _getSpinningStatus
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
      currentId = -1;
    }
  }

  function _spin(slotIndex) {
    var spinStarted = false;
    if (slotIndex !== undefined && slotIndex < slots.length) {
      var s = slots[slotIndex];
      if (s.isSpinning() === false || _override === true) {
        s.spin();
        setSpin(s);
      }
      spinStarted = true;
    } else {
      for (var i = 0; i < slots.length; i++) {
        var s = slots[i];
        if (s.isSpinning() === false) {
          s.spin();
        }
        spinStarted = spinStarted === false ? s.isSpinning() === true : true;
        setSpin(s);
      }
    }
    if (spinStarted) {
      dispatchEvent(EVENT_SPIN_START, {
        command: _COMMAND_SPIN
      });
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
      if (s.isSpinning() === false || _override === true) {
        _goto(dest, slotIndex, true);
      }
    } else {
      for (var i = 0; i < slots.length; i++) {
        if (slots[i].isSpinning() !== false && _override === true) {
          return;
        }
      }
      var idTo = currentId;
      if (isNaN(currentId) || currentId <= 0) {
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
      if (s.isSpinning() === false || _override === true) {
        _goto(dest, slotIndex);
      }
    } else {
      for (var i = 0; i < slots.length; i++) {
        if (slots[i].isSpinning() === true && _override === false) {
          return;
        }
      }
      var idTo = currentId
      if (isNaN(currentId) || currentId >= totalSlots - 1) {
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
      if (s.isSpinning() === false || _override === true) {
        s.gotoSlice(id, backspin);
        setSpin(s);
        currentId = id;
        willGo = true;
      }
    } else {
      for (var i = 0; i < slots.length; i++) {
        var s = slots[i];
        if (s.isSpinning() === false || _override === true) {
          s.gotoSlice(id, backspin);
          setSpin(s);
          currentId = id;
          willGo = true;
        }
      }
      if (willGo === true) {
        dispatchEvent(EVENT_SPIN_START, {
          command: _COMMAND_GOTO,
          index: id,
          backspin: backspin
        });
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

  function _setIndex(index) {
    currentId = index;
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
    setSpinOverride: _setSpinOverride,
    setIndex: _setIndex
  };
}
