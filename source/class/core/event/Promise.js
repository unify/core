/*
==================================================================================================
  Core - JavaScript Foundation
  Copyright 2013 Sebastian Fastner
==================================================================================================
*/

"use strict";

/**
 * Promises implementation of A+ specification passing Promises/A+ test suite.
 * Very efficient due to object pooling if release() is called.
 * http://promises-aplus.github.com/promises-spec/
 */
core.Class("core.event.Promise", 
{
	pooling : true,
	include : [core.util.MLogging],
	
	construct : function() 
	{
		// Initialize lists on new Promises
		if (this.__onFulfilledQueue == null)
		{
			this.__onFulfilledQueue = [];
			this.__onRejectedQueue = [];
		}
	},
	
	members : 
	{
		/** {=String} Current state */
		__state : "pending",


		/** {=Boolean} Whether the promise is locked */
		__locked : false,


		/** {=any} Any value */
		__valueOrReason : null,


		/** 
		 * {any} Returns the value of the promise
		 */
		getValue : function() {
			return this.__valueOrReason;
		},


		/**
		 * {String} Returns the current state. One of pending, fulfilled or rejected.
		 */
		getState : function() {
			return this.__state;
		},


		/**
		 * Fulfill promise with @value {any?}.
		 */
		fulfill : function(value) 
		{
			if (!this.__locked) 
			{
				this.__locked = true;
				this.__state = "fulfilled";
				this.__valueOrReason = value;

				core.Function.immediate(this.__execute, this);
			}
		},
		

		/**
		 * Reject promise with @reason {String|any?}.
		 */
		reject : function(reason) 
		{
			if (!this.__locked) 
			{
				this.__locked = true;
				this.__state = "rejected";
				this.__valueOrReason = reason;

				core.Function.immediate(this.__execute, this);
			}
		},

	
		/**
		 * Executes a single fulfillment or rejection queue @entry {Array} 
		 * with the give @valueOrReason {any} and @state {String}.
		 */	
		__executeEntry : function(entry, valueOrReason, state) 
		{
			var child = entry[0];
			var callback = entry[1];
			var unsafe = entry[3];

			if (callback == null) 
			{
				if (state == "rejected") {
					child.reject(valueOrReason);
				} else {
					child.fulfill(valueOrReason);
				}
			}
			else
			{
				var retval;
				var context = entry[2];
				if (!unsafe)
				{
					try 
					{
						retval = context ? callback.call(context, valueOrReason) : callback(valueOrReason);
					} 
					catch (ex) {
						child.reject(ex);
					}
				}
				else
				{
					retval = context ? callback.call(context, valueOrReason) : callback(valueOrReason);
				}

				if (retval && retval.then && typeof retval.then == "function") 
				{ 
					var retstate = retval.getState ? retval.getState() : "pending";
					if (retstate == "pending") 
					{
						retval.then(function(value) {
							child.fulfill(value);
						}, function(reason) {
							child.reject(reason);
						});
					}
					else if (retstate == "fulfilled") 
				  {
						child.fulfill(retval.getValue());
					}
					else if (retstate == "rejected") 
					{
						child.reject(retval.getValue());
					}
				} 
				else 
				{
					child.fulfill(retval);
				}
			}
		},


		/**
		 * Handle fulfillment or rejection of promise
		 * Runs all registered then handlers
		 */
		__execute : function() 
		{
			// Shorthands
			var state = this.__state;
			var queue = state == "rejected" ? this.__onRejectedQueue : this.__onFulfilledQueue;
			var valueOrReason = this.__valueOrReason;

			// Always repeat queue length check as queue could be changed within handler
			for (var i=0; i<queue.length; i++) {
				this.__executeEntry(queue[i], valueOrReason, state);
			}

			// Cleanup lists for next usage
			this.__onRejectedQueue.length = this.__onFulfilledQueue.length = 0;
		},


		/**
		 * Releases the promise instance to the pool for reusage.
		 */
		release : function()
		{
			// Cleanup internal state
			this.__state = "pending";
			this.__locked = false;

			// Release for next usage
			core.event.Promise.release(this);
		},
		

		/**
		 * {core.event.Promise} Register fulfillment handler @onFulfilled {Function}
		 * and rejection handler @onRejected {Function} returning new child promise.
		 * If @unsafe {Boolean} is true, no try and catch surrounds executing functions,
		 * so application execution is stopped due to uncatched error.
		 */
		then : function(onFulfilled, onRejected, context, unsafe) 
		{
			var child = core.event.Promise.obtain();

			var fullfilledQueue = this.__onFulfilledQueue;
			var rejectedQueue = this.__onRejectedQueue;

			if (onFulfilled && typeof onFulfilled == "function") {
				fullfilledQueue.push([child, onFulfilled, context, !!unsafe]);
			} else {
				fullfilledQueue.push([child, null, null, !!unsafe]);
			}

			if (onRejected && typeof onRejected == "function") {
				rejectedQueue.push([child, onRejected, context, !!unsafe]);
			} else {
				rejectedQueue.push([child, null, null, !!unsafe]);
			}

			if (this.__locked) {
				core.Function.immediate(this.__execute, this);
			}
			
			return child;
		},

		/**
		 * Throws all remaining errors to application level and display promise rejecting
		 * on console if in debug mode.
		 */
		done : function() 
		{
			this.then(null, function(reason) {
				if (reason instanceof Error) 
				{
					throw reason;
				}
				else if (jasy.Env.isSet("debug"))
				{
					console.error("Promise rejected: ", reason);
				}
			}, null, true);
		}
	}
});

