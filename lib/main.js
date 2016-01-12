/**
 *
 * @licstart  The following is the entire license notice for the JavaScript code in this file. 
 *
 * Wrap command-line interface implementations in a function that takes care of interacting with the interpreter
 *
 * Copyright (c) 2015 University Of Helsinki (The National Library Of Finland)
 *
 * This file is part of cli-wrap
 *
 * cli-wrap is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this file.
 *
 **/

/* istanbul ignore next: umd wrapper */
(function(root, factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['es6-polyfills/lib/polyfills/promise', 'es6-polyfills/lib/polyfills/object', 'stream', 'console'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('es6-polyfills/lib/polyfills/promise'), require('es6-polyfills/lib/polyfills/object'), require('stream'), require('console'));
    }

}(this, factory));

function factory(Promise, Object, stream, console)
{

    'use strict';

    /**
     * @param {function} fn
     * @param {string} [name='']
     * @param {array} [argv=[]]
     * @param {object} [options={}]
     */
    return function(fn)
    {
    
	var retval,
	count_args = 1,
	options = {
	    name: '',
	    argv: process.argv.slice(2),
	    exitCallback: process.exit,
	    stdout: process.stdout,
	    stderr: process.stderr,
	    stdin: process.stdin
	};

	if (typeof arguments[1] === 'string') {
	    options.name = arguments[1];
	} else if (Array.isArray(typeof arguments[1])) {
	    options.argv = arguments[1];
	} else if (typeof arguments[1] === 'object') {
	    options = Object.apply(options, arguments[1]);
	}

	if (Array.isArray(typeof arguments[1])) {
	    options.argv = arguments[2];
	} else if (typeof arguments[2] === 'object') {
	    options = Object.apply(options, arguments[1]);
	}

	if (typeof arguments[3] === 'object') {
	    options = Object.apply(options, arguments[1]);
	}

	if (typeof fn !== 'function') {
	    throw new Error('Function was not provided');
	}
	if (typeof options.exitCallback !== 'function') {
	    throw new Error('exitCallback is not a function');
	}
	if (typeof options.stdout.write !== 'function' && typeof options.stdout.end !== 'function') {
	    throw new Error('stdout does not have mandatory methods');
	}
	if (typeof options.stderr.write !== 'function' && typeof options.stderr.end !== 'function') {
	    throw new Error('stderr does not have mandatory methods');
	}
	if (!stream.Readable.prototype.isPrototypeOf(options.stdin)) {
	    throw new Error('stdin is not a prototype of stream.Readable');
	}

	try {
	    
	    retval = fn(options.name, options.argv, new console.Console(options.stdout, options.stderr), {
		stdio: options.stdio,
		stdout: options.stdout,
		stderr: options.stderr,
	    });

	    if (retval instanceof Promise) {
		return retval.then(
		    function(result) {
			options.exitCallback(typeof result === 'number' ? result : 0);
		    },
		    function(reason) {
			if (typeof reason === 'number') {
			    options.exitCallback(reason);
			} else {
			    console.error(reason);
			    options.exitCallback(-1);
			}
		    }
		);
	    } else {
		options.exitCallback(typeof retval === 'number' ? retval : 0);
	    }

	} catch (e) {
	    if (typeof e === 'number') {
		options.exitCallback(e);
	    } else {
		console.error(e.stack);
		options.exitCallback(-1);
	    }
	}

    };

}